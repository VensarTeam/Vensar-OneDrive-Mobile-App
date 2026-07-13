export type HomeAction = {
  id: string;
  title: string;
  description: string;
};

export type HomeState = {
  title: string;
  subtitle: string;
  actions: HomeAction[];
};
