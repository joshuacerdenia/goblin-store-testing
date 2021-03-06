import { renderHook } from "@testing-library/react-hooks";
import { useProducts } from "./useProducts";
import { act } from "react-dom/test-utils"

// useProducts hook does the following:
// [1] Fetch data on mount.
// [2] While data is loading, returns isLoading = true.
// [3] If loading fails, returns error = true.
// [4] when data is loaded, returns the loaded data.

describe("useProducts", () => {
  it("fetches products on mount", async () => {
    const mockApiGetProducts = jest.fn()
    await act(async () => {renderHook(() => useProducts(mockApiGetProducts))})
    expect(mockApiGetProducts).toHaveBeenCalled()
  })

  describe("while waiting API response", () => {
    it("returns correct loading state data", () => {
      const mockApiGetProducts = jest.fn(() => new Promise(() => {})) // will never resolve
      const { result } = renderHook(() => useProducts(mockApiGetProducts))
      
      expect(result.current.isLoading).toEqual(true)
      expect(result.current.error).toEqual(false)
      expect(result.current.categories).toEqual([])
    })
  })

  describe("with error response", () => {
    it("returns error state data", async () => {
      const mockApiGetProducts = jest.fn(() => new Promise((resolve, reject) => reject("Error")))
      const { result, waitForNextUpdate } = renderHook(() => useProducts(mockApiGetProducts))
      await act(() => waitForNextUpdate())

      expect(result.current.isLoading).toEqual(false)
      expect(result.current.error).toEqual("Error")
      expect(result.current.categories).toEqual([])
    })
  })

  describe("with successful response", () => {
    it("returns successful state data", async () => {
      const mockApiGetProducts = jest.fn(() => {
        return new Promise((resolve, reject) => {
          resolve({ categories: [{ name: "Category", items: [] }] })
        })
      })

      const { result, waitForNextUpdate } = renderHook(() => useProducts(mockApiGetProducts))
      await act(() => waitForNextUpdate())

      expect(result.current.isLoading).toEqual(false)
      expect(result.current.error).toEqual(false)
      expect(result.current.categories).toEqual([{ name: "Category", items: [] }])
    })
  })
})