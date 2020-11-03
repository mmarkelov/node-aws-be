import {getProductsList} from "../handlers/getProductsList";
import products from "../products";
import headers from "../handlers/headers";

describe("getProductsList", () => {
    it("return correct list", async () => {
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
