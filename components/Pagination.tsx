"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxPagesToShow?: number
}

export function Pagination({ currentPage, totalPages, onPageChange, maxPagesToShow = 5 }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [visiblePages, setVisiblePages] = useState<number[]>([])

  useEffect(() => {
    updateVisiblePages()
  }, [currentPage, totalPages])

  const updateVisiblePages = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    const pages = []
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    setVisiblePages(pages)
  }

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams ?? new URLSearchParams())
    params.set(name, value)
    return params.toString()
  }

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage)
    router.push("?" + createQueryString("page", String(newPage)))
  }

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={isFirstPage}
        className="px-4 py-2 bg-gray-100 rounded-full disabled:opacity-50"
      >
        上一页
      </button>
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-4 py-2 rounded-full ${currentPage === page ? "bg-blue-500 text-white" : "bg-gray-100"}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={isLastPage}
        className="px-4 py-2 bg-gray-100 rounded-full disabled:opacity-50"
      >
        下一页
      </button>
    </div>
  )
} 