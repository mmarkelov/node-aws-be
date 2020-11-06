import {getProductById} from "../handlers/getProductById";
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
    product_id: "bc24cfa9-ae49-4803-a397-e347a9edcf52",
    count: "5",
}];

describe("getProductById", () => {
    let pool;
    beforeEach(() => {
        pool = new Pool();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return not found code if product does not exist", async () => {
        const mockEvent = {
            pathParameters: {
                productId: "not-exist"
            }
        }

        pool.connect.mockResolvedValueOnce({
            query: jest.fn().mockResolvedValueOnce({ rows: [], rowCount: 0 }),
            release: jest.fn(),
        });

        // @ts-ignore
        const res = await getProductById(mockEvent)
        expect(res).toEqual({
            statusCode: 404,
            body: 'Not found',
            headers,
        })
    })

    it("should return product if product exists", async () => {
        const mockEvent = {
            pathParameters: {
                productId: products[0].id
            }
        }

        pool.connect.mockResolvedValueOnce({
            query: jest.fn().mockResolvedValueOnce({ rows: products, rowCount: 1 }),
            release: jest.fn(),
        });

        // @ts-ignore
        const res = await getProductById(mockEvent)
        expect(res).toEqual({
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'getProductById',
                product: products[0],
            }, null, 2),
        })
    })
})
