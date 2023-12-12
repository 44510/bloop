import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DropdownSection from '../../../components/Dropdown/Section';
import SectionItem from '../../../components/Dropdown/Section/SectionItem';
import { SplitViewIcon, FileWithSparksIcon } from '../../../icons';

type Props = {
  handleExplain: () => void;
  handleMoveToAnotherSide: () => void;
};

const ActionsDropdown = ({ handleExplain, handleMoveToAnotherSide }: Props) => {
  const { t } = useTranslation();

  const shortcuts = useMemo(() => {
    return {
      explain: ['cmd', 'E'],
      splitView: ['cmd', ']'],
    };
  }, []);

  return (
    <div>
      <DropdownSection>
        <SectionItem
          label={t('Explain file')}
          onClick={handleExplain}
          isFocused
          shortcut={shortcuts.explain}
          icon={<FileWithSparksIcon sizeClassName="w-4 h-4" />}
        />
        <SectionItem
          label={t('Open in split view')}
          shortcut={shortcuts.splitView}
          onClick={handleMoveToAnotherSide}
          isFocused
          icon={<SplitViewIcon sizeClassName="w-4 h-4" />}
        />
      </DropdownSection>
    </div>
  );
};

export default memo(ActionsDropdown);
