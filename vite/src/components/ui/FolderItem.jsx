import folderIcon from '../../assets/icons/folder.png';

const FolderItem = ({
  name,
//   lastModified,
  onSecondaryClick,
  onClick,
  onDoubleClick,
  onDragEvent,
  onDragEnd,
  onKeyBoardEvent,
}) => {
  return (
    <div
      className="flex flex-col gap-2 items-center justify-start rounded-md p-2 hover:scale-105 active:bg-white/10 focus:bg-white/10 transition duration-300 w-[90px] h-[110px]"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onSecondaryClick}
      onDragStart={onDragEvent}
      onDragEnd={onDragEnd}
      onKeyDown={onKeyBoardEvent}
      tabIndex={0}
      draggable
    >
      <img
        src={folderIcon}
        alt="Folder"
        height={56}
        width={56}
        className="inline-block"
      />
      <p className="text-sm text-muted max-w-full text-center w-full overflow-hidden text-ellipsis whitespace-nowrap">
        {name}
      </p>
    </div>
  );
};

export default FolderItem;