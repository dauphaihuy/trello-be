// https://www.mongodb.com/docs/manual/reference/method/cursor.skip/#pagination-example

export const pagingSkipValue = (page, itemsPerPage) => {
    if (!page || itemsPerPage <= 0) return 0

    if (page < 0 || itemsPerPage <= 0) return 0

    // Giải thích công thức đơn giản dễ hiểu:
    // Ví dụ trường hợp mỗi page hiện thì: 12 sản phẩm (itemsPerPage = 12)
    // Case 01: User đứng ở page 1 (page = 1) thì skip 0 = 1 - 1 = 0 sản phẩm được ghi
    // Case 02: User đứng ở page 2 (page = 2) thì sẽ skip 12 - 1 = 1 sau đó nhân với 12
    // Case 03: User đứng ở page 5 (page = 5) thì sẽ skip 5 - 1 = 4 sau đó nhân với 12 = 48,
    // lúc này giá trị skip là 48 bản ghi của page trước đó
    return (page - 1) * itemsPerPage
}