import {getProductsList} from "../handlers/getProductsList";
import {Pool} from 'pg';
import {headers} from "../handlers/helpers";

jest.mock('pg', () => {
    const mPool = {
        connect: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

describe("getProductsList", () => {
    let pool;
    beforeEach(() => {
        pool = new Pool();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("return correct list", async () => {
        const products = [{
            id: "bc24cfa9-ae49-4803-a397-e347a9edcf52",
            title: "ProductOne",
            description: "Short Product Description1",
            price: "10",
            product_id: "bc24cfa9-ae49-4803-a397-e347a9edcf52",
            count: "5",
        }];
        pool.connect.mockResolvedValueOnce({
            query: jest.fn().mockResolvedValueOnce({ rows: products, rowCount: 1 }),
            release: jest.fn(),
        });
        const mockMath = Object.create(global.Math);
        mockMath.random = () => 0.5;
        global.Math = mockMath;

        // @ts-ignore
        const res = await getProductsList()
        expect(res).toEqual({
            statusCode: 200,
            headers,
            body: JSON.stringify(
                products.map((item) => ({
                    ...item,
                    image: `https://source.unsplash.com/random?sig=${Math.random()}`,
                })),
                null,
                2
            ),
        })
    })
})
