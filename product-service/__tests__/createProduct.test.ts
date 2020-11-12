import {createProduct} from "../handlers/createProduct";
import {headers} from "../handlers/helpers";
import {Pool} from "pg";

jest.mock('pg', () => {
    const mPool = {
        connect: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

const products = [{
    id: "bc24cfa9-ae49-4803-a397-e347a9edcf52",
    title: "ProductOne",
    description: "Short Product Description1",
    price: "10",
}];

const stocks = [{count: "2"}];

describe("createProduct", () => {
    let pool;
    beforeEach(() => {
        pool = new Pool();

        const query = jest.fn().mockImplementation((args) => {
            if (args.includes('insert into products')) {
                return Promise.resolve({ rows: products, rowCount: 1 })
            } else if (args.includes('insert into stocks')) {
                return Promise.resolve({ rows: stocks, rowCount: 1 })
            }
            return Promise.resolve()
        });

        pool.connect.mockResolvedValueOnce({
            query,
            release: jest.fn(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 error for invalid body", async () => {
        const mockEvent = {
            body: JSON.stringify({title: 'test'})
        }

        // @ts-ignore
        const res = await createProduct(mockEvent)
        expect(res).toEqual({
            statusCode: 400,
            headers,
            body: 'Bad Request'
        })
    })

    it("should return product for valid body", async () => {
        const mockEvent = {
            body: JSON.stringify({title: 'test', price: 20, count: 2})
        }

        // @ts-ignore
        const res = await createProduct(mockEvent)
        expect(res).toEqual({
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'createProduct',
                product: {...products[0], count: 2},
            }, null, 2),
        })
    })
})
