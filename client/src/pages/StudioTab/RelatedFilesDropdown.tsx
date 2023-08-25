import { memo, PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContextMenu, { ContextMenuItem } from '../../components/ContextMenu';
import {
  ExtendedMenuItemType,
  MenuItemType,
  StudioContextFile,
} from '../../types/general';
import FileIcon from '../../components/FileIcon';

type Props = {
  selectedFiles: StudioContextFile[];
  relatedFiles: { type: string; path: string }[];
  onFileAdded: (filePath: string) => void;
  onFileRemove: (filePath: string) => void;
  isVisible: boolean;
  setVisibility: (b: boolean) => void;
};

const RelatedFilesDropdown = ({
  children,
  relatedFiles,
  selectedFiles,
  onFileRemove,
  onFileAdded,
  isVisible,
  setVisibility,
}: PropsWithChildren<Props>) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<ContextMenuItem[]>([]);

  useEffect(() => {
    const imported = relatedFiles
      .filter((f) => f.type === 'imported')
      .sort((a, b) => (a.path < b.path ? -1 : 1));
    const importing = relatedFiles
      .filter((f) => f.type === 'importing')
      .sort((a, b) => (a.path < b.path ? -1 : 1));
    const menuItems = [];
    if (imported.length) {
      menuItems.push({
        type: ExtendedMenuItemType.DIVIDER_WITH_TEXT,
        text: t('Imported files'),
      });
      menuItems.push(
        ...imported.map((f) => ({
          type: MenuItemType.SELECTABLE,
          icon: <FileIcon filename={f.path} />,
          text: f.path,
          isSelected: !!selectedFiles.find((s) => s.path === f.path),
          onChange: (b: boolean) =>
            b ? onFileAdded(f.path) : onFileRemove(f.path),
        })),
      );
    }
    if (importing.length) {
      menuItems.push({
        type: ExtendedMenuItemType.DIVIDER_WITH_TEXT,
        text: t('Referencing target file'),
      });
      menuItems.push(
        ...importing.map((f) => ({
          type: MenuItemType.SELECTABLE,
          icon: <FileIcon filename={f.path} />,
          text: f.path,
          isSelected: !!selectedFiles.find((s) => s.path === f.path),
          onChange: (b: boolean) =>
            b ? onFileAdded(f.path) : onFileRemove(f.path),
        })),
      );
    }
    setItems(menuItems);
  }, [selectedFiles, relatedFiles, onFileAdded, onFileRemove]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <ContextMenu
        items={items}
        visible={isVisible}
        handleClose={() => setVisibility(false)}
        closeOnClickOutside
        appendTo={document.body}
        isDark
      >
        {children}
      </ContextMenu>
    </div>
  );
};

export default memo(RelatedFilesDropdown);