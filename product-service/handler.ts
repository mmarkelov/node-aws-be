import 'source-map-support/register';

import {getProductsList} from './handlers/getProductsList';
import {getProductById} from './handlers/getProductById';
import {createProduct} from './handlers/createProduct';
import {catalogBatchProcess} from './handlers/catalogBatchProcess';

export {getProductsList, getProductById, createProduct, catalogBatchProcess};
