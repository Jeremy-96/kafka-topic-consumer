import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';

const productsRepository = AppDataSource.getRepository('Product');

export const getAllProducts = async (req: Request, res: Response) => {
  const { limit, offset, ...rest } = req.query || {};

  try {
    const [items, total] = await productsRepository.findAndCount({
      take: Number(limit),
      skip: Number(offset),
      where: rest,
    });

    const currentPage = Math.floor(Number(offset) / Number(limit)) + 1;
    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      pagination: {
        limit,
        offset,
        totalItems: total,
        page: currentPage < totalPages ? currentPage : totalPages,
        totalPages,
      },
      items,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await productsRepository.findOneBy({ id: Number(id) });

    if (!product) {
      res.status(404).json({ error: `Product with id: ${id} not found` });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error fetching product with id: ${id}` });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { locale, productId, data } = req.body;

  try {
    if (!locale || !productId || !data) {
      res.status(400).json({ error: 'Missing required fields' });
    }

    const newProduct = productsRepository.create({ locale, productId, data });

    await productsRepository.save(newProduct);

    res.status(201).json({ product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { locale, productId, data } = req.body;

  try {
    const product = await productsRepository.findOneBy({ id: Number(id) });

    if (!product) {
      res.status(404).json({ error: `Product with id: ${id} not found` });
    }

    if (product && locale) product.locale = locale;
    if (product && productId) product.product_id = productId;
    if (product && data) product.product_data = data;

    if (product) {
      await productsRepository.save(product);
      res.status(200).json({ product });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error updating product with id: ${id}` });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await productsRepository.findOneBy({ id: Number(id) });

    if (!product) {
      res.status(404).json({ error: `Product with id: ${id} not found` });
    }

    if (product) {
      await productsRepository.remove(product);

      res.status(200).json({ message: `Product with id: ${id} deleted successfully` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error deleting product with id: ${id}` });
  }
};
