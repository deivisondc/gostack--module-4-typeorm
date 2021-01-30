import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found.');
    }

    const productsFiltered = await this.productsRepository.findAllById(products);

    let updatedStockProducts: IProduct[] = [];

    const productsFilteredDTO = products.map(product => {
      const filtered = productsFiltered.find(f => f.id === product.id);

      if (!filtered) {
        throw new AppError(`Product ${product.id} does not exists.`);
      }

      if (filtered.quantity < product.quantity) {
        throw new AppError(`Product ${product.id} only has ${filtered.quantity} in stock.`);
      }

      const updatedStockProduct = Object.assign({}, filtered, { quantity: filtered.quantity - product.quantity });
      updatedStockProducts.push(updatedStockProduct);

      return {
        product_id: filtered.id,
        price: filtered.price,
        quantity: product.quantity
      }
    });

    const orders = this.ordersRepository.create({ customer, products: productsFilteredDTO });
    this.productsRepository.updateQuantity(updatedStockProducts);

    return orders;
  }
}

export default CreateOrderService;
