'use server';

type Blog = {
  id: number;
  title: string;
  context: string;
  createdAt: string;
  user: {
    name: string;
  };
  tags: Array<{
    name: string;
    imagePath?: string | null;
  }>;
};

type Tag = {
  id: number;
  name: string;
};

export async function getHomeData() {
  const baseUrl = process.env.URL;

  if (!baseUrl) {
    return {
      latestBlogs: [] as Blog[],
      tags: [] as Tag[],
      recentCount: 0,
    };
  }

  try {
    const [blogsResponse, tagsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/blogs`, {
        next: { revalidate: 60 },
      }),
      fetch(`${baseUrl}/api/tags`, {
        next: { revalidate: 60 },
      }),
    ]);

    if (!blogsResponse.ok || !tagsResponse.ok) {
      return {
        latestBlogs: [] as Blog[],
        tags: [] as Tag[],
        recentCount: 0,
      };
    }

    const blogs = (await blogsResponse.json()) as Blog[];
    const tagsData = (await tagsResponse.json()) as Tag[];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCount = blogs.filter((blog) => new Date(blog.createdAt) >= thirtyDaysAgo).length;

    return {
      latestBlogs: blogs.slice(0, 8),
      tags: tagsData.slice(0, 10),
      recentCount,
    };
  } catch (error) {
    console.error('Failed to fetch home data:', error);
    return {
      latestBlogs: [] as Blog[],
      tags: [] as Tag[],
      recentCount: 0,
    };
  }
}
