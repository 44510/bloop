import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { HistoryConversationTurn } from '../../../../types/api';
import { getCodeStudioHistory } from '../../../../services/api';
import ChevronRight from '../../../../icons/ChevronRight';
import { ArrowHistoryIcon, DateTimeCalendarIcon } from '../../../../icons';
import { useEnterKey } from '../../../../hooks/useEnterKey';
import { getDateFnsLocale } from '../../../../utils';
import { LocaleContext } from '../../../../context/localeContext';
import Badge from '../../../../components/Badge';
import StudioSubItem from './StudioSubItem';

type Props = {
  projectId: string;
  studioId: string;
  shouldRefresh: any;
  focusedIndex: string;
  index: string;
  studioName: string;
  isLeftSidebarFocused: boolean;
  isCommandBarVisible: boolean;
};

const StudioHistory = ({
  projectId,
  studioId,
  shouldRefresh,
  index,
  focusedIndex,
  studioName,
  isCommandBarVisible,
  isLeftSidebarFocused,
}: Props) => {
  const { t } = useTranslation();
  const { locale } = useContext(LocaleContext);
  const [snapshots, setSnapshots] = useState<HistoryConversationTurn[]>([]);
  const [isExpanded, setIsExpanded] = useState(focusedIndex.startsWith(index));

  useEffect(() => {
    getCodeStudioHistory(projectId, studioId).then((r) => setSnapshots(r));
  }, [shouldRefresh, projectId, studioId]);

  useEffect(() => {
    if (focusedIndex.startsWith(index)) {
      setIsExpanded(true);
    }
  }, [focusedIndex, index]);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  useEnterKey(
    handleToggle,
    focusedIndex !== index || !isLeftSidebarFocused || isCommandBarVisible,
  );

  return !snapshots.length ? null : (
    <div>
      <a
        className={`w-full h-7 flex items-center gap-3 pl-10.5 pr-4 cursor-pointer
        hover:text-label-title hover:bg-bg-base-hover ${
          focusedIndex === index
            ? 'bg-bg-sub-hover text-label-title'
            : 'text-label-base'
        }`}
        onClick={handleToggle}
        data-node-index={index}
      >
        <span className="flex items-center gap-3">
          <ChevronRight
            sizeClassName="w-3.5 h-3.5"
            className={`${
              isExpanded ? 'rotate-90' : ''
            } transition-transform duration-150`}
          />
          <ArrowHistoryIcon sizeClassName="w-3.5 h-3.5" />
          <span className="ellipsis">
            <Trans>History</Trans>
          </span>
        </span>
      </a>
      {isExpanded && (
        <div className="relative">
          <div className="absolute top-0 bottom-3 left-12 w-px bg-bg-border" />
          {snapshots.map((s, i) => (
            <StudioSubItem
              key={s.id}
              morePadding
              studioId={studioId}
              focusedIndex={focusedIndex}
              index={`${index}-${s.id}`}
              studioName={studioName}
              isLeftSidebarFocused={isLeftSidebarFocused}
              isCommandBarVisible={isCommandBarVisible}
              snapshot={i === 0 ? null : s}
            >
              <DateTimeCalendarIcon sizeClassName="w-3.5 h-3.5" />
              <span className="flex-1 ellipsis">
                {format(
                  new Date(s.modified_at + '.000Z'),
                  'd MMM · hh:mm a',
                  getDateFnsLocale(locale),
                )}
              </span>
              {i === 0 && (
                <Badge text={t('Current')} type="green" size="mini" />
              )}
            </StudioSubItem>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(StudioHistory);