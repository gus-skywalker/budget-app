import { afterEach, describe, expect, it, vi } from 'vitest'
import axiosInterceptor from '@/services/axiosInterceptor'
import FinancialReadService from '@/services/FinancialReadService'

describe('FinancialReadService transaction period summary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the aggregate endpoint without pagination and preserves canonical filters', async () => {
    const get = vi.spyOn(axiosInterceptor, 'get').mockResolvedValue({ data: {} } as never)

    await FinancialReadService.fetchTransactionPeriodSummary({
      fromDate: '2026-07-01',
      toDate: '2026-07-31',
      accountId: 'account-1',
      categoryId: 7,
      reportScope: 'WORKSPACE_SHARED',
      limit: 20,
      offset: 40,
    })

    expect(get).toHaveBeenCalledWith(expect.stringMatching(/\/transactions\/summary$/), {
      params: expect.objectContaining({
        fromDate: '2026-07-01',
        toDate: '2026-07-31',
        accountId: 'account-1',
        categoryId: 7,
        reportScope: 'WORKSPACE_SHARED',
      }),
    })
    expect(get.mock.calls[0][1]?.params).not.toHaveProperty('limit')
    expect(get.mock.calls[0][1]?.params).not.toHaveProperty('offset')
  })
})
