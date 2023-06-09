import Books from '../models/Book.js';
import Comment from '../models/Comment.js';
import response from '../helpers/response.js';

const booksController = {
  create: async(req, res) => {
    try {
      const { body: { name, price, discount, images, description } }  = req;

      const newBooks = await new Books({
        name,
        price,
        images,
        discount,
        description,
      })
      const books = await newBooks.save();

      return response.success(res, books);
    } catch (error) {
      response.serverError(res, error)
    }
  },
  delete: async(req, res) => {
    try {
      const book = await Books.findById(req.params.id)
      if (!book) {
        return response.error(res, 'Not Found', 404)
      }

      const comment = await Comment.find({ bookId: book.id })
      if (comment.length) {
        return response.error(res, 'Delete Failed', 400)
      }
      const result = await Books.findByIdAndDelete(req.params.id)

      return response.success(res, result, 'Delete books successfully');
    } catch (error) {
      response.serverError(res, error)
    }
  },
  update: async(req, res) => {
    const book = await Books.findByIdAndUpdate(req.params.id, req.body)
    const message = book ? 'Update books successfully': 'Update books failed';
    return response.success(res, Boolean(book), message);
  },
  getList: async(req, res) => {
    const { query: { page = 1 } } = req;

    const total = await Books.find().count();

    const books = await Books.find()
    .skip( +page > 1 ? 10 : 0 )
    .limit(10)
    
    return response.success(res, {
      data: books,
      page: +page,
      limit: 10,
      totalPage: Math.ceil(total/10),
    });
  },
  getListByName: async(req, res) => {
    const { params: { keyword } } = req;

    const books = await Books.find({ name: { $regex: ".*" + keyword +  ".*", $options: 'i'}})
    .limit(10)
    
    return response.success(res, books);
  },
  detail: async(req, res) => {
    const book = await Books.findById(req.params.id)
    return response.success(res, book);
  }
}

export default booksController;
