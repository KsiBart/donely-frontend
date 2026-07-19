export interface CardItem {
  icon: string;
  t: string;
  d: string;
}
export interface ListItem {
  t: string;
  meta: string;
  tag: string;
}
export interface PostItem {
  t: string;
  meta: string;
  d: string;
  hue?: number;
}
export interface FaqItem {
  q: string;
  a: string;
}
export interface DocItem {
  h: string;
  p: string;
}
export type Block =
  | { type: 'cards'; items: CardItem[] }
  | { type: 'list'; action: string; items: ListItem[] }
  | { type: 'posts'; items: PostItem[] }
  | { type: 'faq'; items: FaqItem[] }
  | { type: 'doc'; items: DocItem[] }
  | { type: 'form' };
export interface PageData {
  title: string;
  sub: string;
  blocks: Block[];
}
