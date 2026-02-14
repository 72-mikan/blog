'use server';

export async function getTags() {
  try {
    const response = await fetch(`${process.env.URL}/api/tags`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return [];
    }

    const tags = await response.json();
    return tags;
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
}
