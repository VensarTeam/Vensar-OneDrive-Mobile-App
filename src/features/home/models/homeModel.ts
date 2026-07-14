export type DriveFile = {
  id: string;
  name: string;
  meta: string;
  icon: string;
  tint: string;
};

export type HomeState = {
  files: DriveFile[];
};
