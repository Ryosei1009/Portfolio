// カテゴリ一覧（Works と Repositories の両方で使う）。ページを開いている間は1回だけ取りに行く
// 失敗したときは、次に呼ばれたときにもう一度取りに行く
let request = null

export const fetchCategories = () => {
    if (!request) {
        request = fetch(`${process.env.REACT_APP_API_DOMAIN}/categories/get`)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                return response.json()
            })
            .catch((error) => {
                request = null
                throw error
            })
    }
    return request
}
