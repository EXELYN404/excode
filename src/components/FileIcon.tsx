import materialIcons from '../generated/materialIconManifest';

type MaterialManifest = {
  file: string;
  folder: string;
  folderExpanded: string;
  rootFolder: string;
  rootFolderExpanded: string;
  fileExtensions: Record<string, string>;
  fileNames: Record<string, string>;
  folderNames: Record<string, string>;
  folderNamesExpanded: Record<string, string>;
  rootFolderNames: Record<string, string>;
  rootFolderNamesExpanded: Record<string, string>;
  iconDefinitions: Record<string, string>;
};


interface FileIconProps {
  name: string;
  size?: number;
  style?: React.CSSProperties;
  kind?: 'file' | 'folder';
  expanded?: boolean;
  root?: boolean;
}

function getIconName({
  name,
  kind,
  expanded,
  root,
}: Pick<FileIconProps, 'name' | 'kind' | 'expanded' | 'root'>): string {
  const m = materialIcons as unknown as MaterialManifest;
  const lower = name.toLowerCase();

  if (kind === 'folder') {
    const folderName = root
      ? (expanded ? m.rootFolderNamesExpanded[lower] : m.rootFolderNames[lower])
      : (expanded ? m.folderNamesExpanded[lower] : m.folderNames[lower]);

    return folderName ?? (
      root
        ? (expanded ? m.rootFolderExpanded : m.rootFolder)
        : (expanded ? m.folderExpanded : m.folder)
    );
  }

  return m.fileNames[name]
    ?? m.fileNames[lower]
    ?? m.fileExtensions[lower.includes('.') ? lower.split('.').pop()! : lower]
    ?? m.file;
}

export default function FileIcon({
  name,
  size = 14,
  style,
  kind = 'file',
  expanded = false,
  root = false,
}: FileIconProps) {
  const iconName = getIconName({ name, kind, expanded, root });
  const filename = (materialIcons as unknown as MaterialManifest).iconDefinitions[iconName];

  if (!filename) {
    return null;
  }

  return (
    <img
      aria-hidden="true"
      draggable={false}
      src={`/excode-material-icons/${filename}`}
      alt=""
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'inline-block',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
