import {catalogBatchProcess} from "../handlers/catalogBatchProcess";
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

describe("catalogBatchProcess", () => {
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

    it("should not create product for invalid body", async () => {
        const consoleSpy = jest.spyOn(console, 'log');
        const body = {title: 'test'};

        const mockEvent = {
            Records: [{body: JSON.stringify(body)}]
        }

        // @ts-ignore
        await catalogBatchProcess(mockEvent)
        expect(consoleSpy).toHaveBeenCalledWith(`Fail creating a product ${JSON.stringify(body)}`);
    })

    it("should create product for valid body", async () => {
        const consoleSpy = jest.spyOn(console, 'log');
        const body = {title: 'test', price: 100, count: 5};

        const mockEvent = {
            Records: [{body: JSON.stringify(body)}]
        }

        // @ts-ignore
        await catalogBatchProcess(mockEvent)
        expect(consoleSpy).toHaveBeenCalledWith('Product created');
    })
})
