use std::{collections::HashMap, sync::Arc};

use super::prelude::*;
use crate::{
    indexes::{
        reader::{ContentReader, FileReader, RepoReader},
        Indexes,
    },
    query::{
        execute::{ApiQuery, ExecuteQuery, QueryResult},
        parser,
        parser::{Literal, Target},
    },
};

use axum::{extract::Query, response::IntoResponse as IntoAxumResponse, Extension};
use futures::{stream, StreamExt, TryStreamExt};
use serde::Serialize;

pub(super) async fn handle(
    Query(mut api_params): Query<ApiQuery>,
    Extension(indexes): Extension<Arc<Indexes>>,
) -> Result<impl IntoAxumResponse> {
    // Override page_size and set to low value
    api_params.page = 0;
    api_params.page_size = 10;

    let queries = parser::parse(&api_params.q).map_err(Error::user)?;
    let mut autocomplete_results = vec![];

    // Only execute prefix search on flag names if there is a non-regex content target.
    // Always matches against the last query.
    //
    //      `la repo:bloop or sy` -> search with prefix `sy`
    //      `repo:bloop re path:src` -> search with prefix `re`
    if let Some(Target::Content(Literal::Plain(q))) = queries.last().unwrap().target.clone() {
        autocomplete_results.append(
            &mut complete_flag(&q)
                .map(|f| QueryResult::Flag(f.to_string()))
                .collect(),
        );
    }

    // If no flags completion, run a search with full query
    if autocomplete_results.is_empty() {
        let contents = ContentReader.execute(&indexes.file, &queries, &api_params);
        let repos = RepoReader.execute(&indexes.repo, &queries, &api_params);
        let files = FileReader.execute(&indexes.file, &queries, &api_params);

        let (langs, list) = stream::iter([contents, repos, files])
            // Buffer several readers at the same time. The exact number is not important; this is
            // simply an upper bound.
            .buffered(10)
            .try_fold(
                (HashMap::<String, usize>::new(), Vec::new()),
                |(mut langs, mut list), e| async {
                    for (lang, count) in e.stats.lang {
                        // The exact number here isn't relevant, and
                        // this may be off.
                        //
                        // We're trying to scale the results compared
                        // to each other which means this will still
                        // serve the purpose for ranking.
                        *langs.entry(lang).or_default() += count;
                    }
                    list.extend(e.data.into_iter());
                    Ok((langs, list))
                },
            )
            .await
            .map_err(Error::internal)?;

        autocomplete_results.extend(list);

        let mut ranked_langs = langs.into_iter().collect::<Vec<_>>();
        ranked_langs.sort_by(|(_, a_count), (_, b_count)| a_count.cmp(b_count));
        autocomplete_results.extend(ranked_langs.into_iter().map(|(l, _)| QueryResult::Lang(l)));
    }

    Ok(json(AutocompleteResponse {
        count: autocomplete_results.len(),
        data: autocomplete_results,
    }))
}

fn complete_flag(q: &str) -> impl Iterator<Item = &str> + '_ {
    QUERY_FLAGS
        .iter()
        .filter(move |f| f.starts_with(q))
        .copied()
}

#[derive(Serialize)]
pub(super) struct AutocompleteResponse {
    count: usize,
    data: Vec<QueryResult>,
}

impl super::ApiResponse for AutocompleteResponse {}

const QUERY_FLAGS: &[&str; 8] = &[
    "repo", "path", "content", "symbol", "lang", "case", "or", "open",
];
