import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import heroImage from '../../../assets/hero.png';
import ProductCard from './ProductCard';

const sampleProduct = {
  id: 'mask-oni-01',
  slug: 'oni-wall-mask',
  name: 'Oni Wall Mask',
  priceInr: 6499,
  shortDescription: 'Hand-finished resin mask designed for display shelves and feature walls.',
  imageUrl: heroImage,
  maskType: 'Oni',
  inStock: true,
};

const meta: Meta<typeof ProductCard> = {
  title: 'Catalog/ProductCard',
  component: ProductCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  args: {
    product: sampleProduct,
  },
};

export default meta;

type Story = StoryObj<typeof ProductCard>;

export const InStock: Story = {};

export const OutOfStock: Story = {
  args: {
    product: {
      ...sampleProduct,
      inStock: false,
      priceInr: 7299,
    },
  },
};
