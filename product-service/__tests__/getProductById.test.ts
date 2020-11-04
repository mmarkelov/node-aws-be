import {getProductById} from "../handlers/getProductById";
import products from "../products";
import headers from "../handlers/headers";

describe("getProductById", () => {
    it("should return not found code if product does not exist", async () => {
        const mockEvent = {
            pathParameters: {
                productId: "not-exist"
            }
        }

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

        // @ts-ignore
        const res = await getProductById(mockEvent)
        expect(res).toEqual({
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'getProductById',
                product: products[0],
                jsonplaceholderData: {
                    "userId": 1,
                    "id": 1,
                    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
                    "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
                }
            }, null, 2),
        })
    })
})
