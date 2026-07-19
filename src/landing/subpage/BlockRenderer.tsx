import type { Block } from './types';
import { CardsBlock } from './CardsBlock';
import { ListBlock } from './ListBlock';
import { PostsBlock } from './PostsBlock';
import { FaqBlock } from './FaqBlock';
import { DocBlock } from './DocBlock';
import { ContactForm } from './ContactForm';

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'cards':
      return <CardsBlock items={block.items} />;
    case 'list':
      return <ListBlock action={block.action} items={block.items} />;
    case 'posts':
      return <PostsBlock items={block.items} />;
    case 'faq':
      return <FaqBlock items={block.items} />;
    case 'doc':
      return <DocBlock items={block.items} />;
    case 'form':
      return <ContactForm />;
    default:
      return null;
  }
}
