'use server';

export async function getTags() {
  try {
    const response = await fetch(`${process.env.URL}/api/tags`, {
      cache: 'no-store',
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
