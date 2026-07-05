import type { Meta, StoryObj } from '@storybook/react-vite';
import CartSummary from './CartSummary';

const meta: Meta<typeof CartSummary> = {
  title: 'Cart/CartSummary',
  component: CartSummary,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof CartSummary>;

export const Populated: Story = {
  args: {
    cart: {
      items: [],
      totalItems: 3,
      totalPriceInr: 15497,
    },
  },
};

export const Empty: Story = {
  args: {
    cart: {
      items: [],
      totalItems: 0,
      totalPriceInr: 0,
    },
  },
};
