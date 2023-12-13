import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { EnvContext } from '../../../../context/envContext';
import {
  ChatMessage,
  ChatMessageServer,
  InputEditorContent,
  ParsedQueryType,
} from '../../../../types/general';
import { getAutocomplete } from '../../../../services/api';
import { FileResItem, LangItem, RepoItem } from '../../../../types/api';
import useKeyboardNavigation from '../../../../hooks/useKeyboardNavigation';
import KeyboardHint from '../../../../components/KeyboardHint';
import { focusInput } from '../../../../utils/domUtils';
import InputCore from './InputCore';
import { mapEditorContentToInputValue } from './utils';

type Props = {
  value?: { parsed: ParsedQueryType[]; plain: string };
  valueToEdit?: Record<string, any> | null;
  generationInProgress?: boolean;
  isStoppable?: boolean;
  onStop?: () => void;
  setInputValue: Dispatch<
    SetStateAction<{ parsed: ParsedQueryType[]; plain: string }>
  >;
  selectedLines?: [number, number] | null;
  setSelectedLines?: (l: [number, number] | null) => void;
  queryIdToEdit?: string;
  onMessageEditCancel?: () => void;
  conversation: ChatMessage[];
  hideMessagesFrom: number | null;
  setConversation: Dispatch<SetStateAction<ChatMessage[]>>;
  setSubmittedQuery: Dispatch<
    SetStateAction<{ parsed: ParsedQueryType[]; plain: string }>
  >;
  submittedQuery: { parsed: ParsedQueryType[]; plain: string };
};

type SuggestionType = {
  id: string;
  display: string;
  type: 'file' | 'dir' | 'lang' | 'repo';
  isFirst: boolean;
};

const ConversationInput = ({
  value,
  valueToEdit,
  setInputValue,
  generationInProgress,
  isStoppable,
  onStop,
  selectedLines,
  setSelectedLines,
  queryIdToEdit,
  onMessageEditCancel,
  conversation,
  hideMessagesFrom,
  setConversation,
  setSubmittedQuery,
  submittedQuery,
}: Props) => {
  const { t } = useTranslation();
  const { envConfig } = useContext(EnvContext);
  const [initialValue, setInitialValue] = useState<
    Record<string, any> | null | undefined
  >({
    type: 'paragraph',
    content: value?.parsed
      .filter((pq) => ['path', 'lang', 'text'].includes(pq.type))
      .map((pq) =>
        pq.type === 'text'
          ? { type: 'text', text: pq.text }
          : {
              type: 'mention',
              attrs: {
                id: pq.text,
                display: pq.text,
                type: pq.type,
                isFirst: false,
              },
            },
      ),
  });
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    setHasRendered(true);
    setTimeout(focusInput, 500);
  }, []);

  useEffect(() => {
    if (hasRendered) {
      setInitialValue(valueToEdit);
    }
  }, [valueToEdit]);

  const onSubmit = useCallback(
    (value: { parsed: ParsedQueryType[]; plain: string }) => {
      if (
        (conversation[conversation.length - 1] as ChatMessageServer)
          ?.isLoading ||
        !value.plain.trim()
      ) {
        return;
      }
      if (hideMessagesFrom !== null) {
        setConversation((prev) => prev.slice(0, hideMessagesFrom));
      }
      setSubmittedQuery(value);
    },
    [conversation, submittedQuery, hideMessagesFrom],
  );

  const onChangeInput = useCallback((inputState: InputEditorContent[]) => {
    setInputValue(mapEditorContentToInputValue(inputState));
  }, []);

  const onSubmitButtonClicked = useCallback(() => {
    if (value && onSubmit) {
      onSubmit(value);
    }
  }, [value, onSubmit]);
  const getDataPath = useCallback(async (search: string) => {
    const respPath = await getAutocomplete(`path:${search}&content=false`);
    const fileResults = respPath.data.filter(
      (d): d is FileResItem => d.kind === 'file_result',
    );
    const dirResults = fileResults
      .filter((d) => d.data.is_dir)
      .map((d) => d.data.relative_path.text);
    const filesResults = fileResults
      .filter((d) => !d.data.is_dir)
      .map((d) => d.data.relative_path.text);
    const results: SuggestionType[] = [];
    filesResults.forEach((fr, i) => {
      results.push({ id: fr, display: fr, type: 'file', isFirst: i === 0 });
    });
    dirResults.forEach((fr, i) => {
      results.push({ id: fr, display: fr, type: 'dir', isFirst: i === 0 });
    });
    return results;
  }, []);

  const getDataLang = useCallback(
    async (
      search: string,
      // callback: (a: { id: string; display: string }[]) => void,
    ) => {
      const respLang = await getAutocomplete(`lang:${search}&content=false`);
      const langResults = respLang.data
        .filter((d): d is LangItem => d.kind === 'lang')
        .map((d) => d.data);
      const results: SuggestionType[] = [];
      langResults.forEach((fr, i) => {
        results.push({ id: fr, display: fr, type: 'lang', isFirst: i === 0 });
      });
      return results;
    },
    [],
  );

  const getDataRepo = useCallback(
    async (
      search: string,
      // callback: (a: { id: string; display: string }[]) => void,
    ) => {
      const respRepo = await getAutocomplete(
        `repo:${search}&content=false&path=false&file=false`,
      );
      const repoResults = respRepo.data
        .filter((d): d is RepoItem => d.kind === 'repository_result')
        .map((d) => d.data);
      const results: SuggestionType[] = [];
      repoResults.forEach((rr, i) => {
        results.push({
          id: rr.name.text,
          display: rr.name.text.replace('github.com/', ''),
          type: 'repo',
          isFirst: i === 0,
        });
      });
      return results;
    },
    [],
  );

  const handleKeyEvent = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        ((onMessageEditCancel && queryIdToEdit) || (isStoppable && onStop))
      ) {
        e.preventDefault();
        e.stopPropagation();
        onMessageEditCancel?.();
        onStop?.();
      }
    },
    [onMessageEditCancel, isStoppable, onStop],
  );
  useKeyboardNavigation(handleKeyEvent, !queryIdToEdit && !isStoppable);

  return (
    <div className="flex items-start w-full p-4 gap-4 rounded-md">
      <div className="w-7 h-7 rounded-full overflow-hidden select-none">
        <img src={envConfig.github_user?.avatar_url} alt={t('avatar')} />
      </div>
      <div className="flex flex-col gap-1 flex-1 items-start">
        <p className="body-base-b text-label-title">
          <Trans>You</Trans>
        </p>
        <InputCore
          getDataLang={getDataLang}
          getDataPath={getDataPath}
          getDataRepo={getDataRepo}
          initialValue={initialValue}
          onChange={onChangeInput}
          onSubmit={onSubmit}
          placeholder={t(
            'Write a message, @ to mention files, folders or docs...',
          )}
        />
        <div className="self-end flex gap-2 items-center">
          {isStoppable && (
            <button
              className="flex gap-1 items-center py-1 pr-1 pl-2 rounded-6 body-mini-b text-label-base bg-bg-base disabled:text-label-muted disabled:bg-bg-base"
              onClick={onStop}
            >
              <Trans>Stop generating</Trans>
              <KeyboardHint shortcut="Esc" />
            </button>
          )}
          {!!queryIdToEdit && (
            <button
              className="flex gap-1 items-center py-1 pr-1 pl-2 rounded-6 body-mini-b text-label-base bg-bg-base disabled:text-label-muted disabled:bg-bg-base"
              onClick={onMessageEditCancel}
            >
              <Trans>Cancel</Trans>
              <KeyboardHint shortcut="Esc" />
            </button>
          )}
          <button
            className="flex gap-1 items-center py-1 pr-1 pl-2 rounded-6 body-mini-b text-label-base bg-bg-base disabled:text-label-muted disabled:bg-bg-base"
            disabled={!value?.plain || generationInProgress}
            onClick={onSubmitButtonClicked}
          >
            <Trans>Submit</Trans>
            <KeyboardHint shortcut="entr" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ConversationInput);
