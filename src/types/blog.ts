export type Blog = {
  id: number;
  title: string;
  context: string;
  isPublic: boolean;
  createdAt: string;
  user: {
    name: string;
  };
  tags: Array<{
    name: string;
    imagePath?: string | null;
  }>;
};

export type GetBlogsResult = {
  blogs: Blog[];
  total: number;
  totalPages: number;
};

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
