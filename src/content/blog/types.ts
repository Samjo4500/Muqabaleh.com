export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  date: string;
  readingTime: number;
  image: string;
  keywords: string[];
  relatedSlugs: string[];
  content: string;
}
