import { Dispatch, memo, SetStateAction } from 'react';
import {
  CommandBarItemCustomType,
  CommandBarItemGeneralType,
} from '../../types/general';
import SectionDivider from './SectionDivider';
import Item from './Item';

type Props = {
  title?: string;
  items: (CommandBarItemCustomType | CommandBarItemGeneralType)[];
  focusedIndex: number;
  setFocusedIndex: Dispatch<SetStateAction<number>>;
  offset: number;
  disableKeyNav?: boolean;
  onlyOneClickable?: string;
};

const CommandBarBodySection = ({
  title,
  items,
  setFocusedIndex,
  offset,
  focusedIndex,
  disableKeyNav,
  onlyOneClickable,
}: Props) => {
  return (
    <div className="flex flex-col select-none">
      {!!title && <SectionDivider text={title} />}
      {items.map(({ key, ...Rest }, i) =>
        'Component' in Rest ? (
          <Rest.Component
            {...Rest.componentProps}
            key={key}
            isFocused={focusedIndex === i + offset}
            setFocusedIndex={setFocusedIndex}
            isFirst={i === 0}
            i={i + offset}
            disableKeyNav={disableKeyNav}
            onlyOneClickable={onlyOneClickable}
          />
        ) : (
          <Item
            key={key}
            {...Rest}
            i={i + offset}
            isFocused={focusedIndex === i + offset}
            setFocusedIndex={setFocusedIndex}
            isFirst={i === 0}
            disableKeyNav={disableKeyNav}
            itemKey={key}
            onlyOneClickable={onlyOneClickable}
          />
        ),
      )}
    </div>
  );
};

export default memo(CommandBarBodySection);