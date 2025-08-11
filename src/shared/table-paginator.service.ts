import { PaginationModel } from 'src/configs/interfaces/pagination.model';

export class PaginationService {
  async pageData(
    data: any[],
    repository: any,
    filter: any,
    pagination: PaginationModel,
  ) {
    const count = await repository.count({
      where: filter,
    });

    return {
      data: data,
      totalCount: count,
      pageCount: Math.ceil(count / pagination.limit),
      page: pagination.page,
    };
  }
}
