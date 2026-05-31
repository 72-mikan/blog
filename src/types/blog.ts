export type BlogDetail = {
  id: number;
  title: string;
  context: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
  };
  tags: Array<{
    name: string;
  }>;
};
