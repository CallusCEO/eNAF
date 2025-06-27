import { DataType } from "@/types/DataType";
import { SortCriteria } from "@/types/sortCriteria";

export const sortData = (data: DataType[], criteria: SortCriteria, order: 'asc' | 'desc' = 'asc'): DataType[] => {
    return data.sort((a, b) => {
        if (criteria === 'reliability') {
            const reliabilityOrder = { high: 2, medium: 1, low: 0 };
            const diff = reliabilityOrder[a.reliability] - reliabilityOrder[b.reliability];
            return order === 'asc' ? diff : -diff;
        }
        if (order === 'asc') {
            if (a[criteria as keyof DataType] < b[criteria as keyof DataType]) {
                return -1;
            }
            if (a[criteria as keyof DataType] > b[criteria as keyof DataType]) {
                return 1;
            }
        } else {
            if (a[criteria as keyof DataType] > b[criteria as keyof DataType]) {
                return -1;
            }
            if (a[criteria as keyof DataType] < b[criteria as keyof DataType]) {
                return 1;
            }
        }
        return 0;
    });
}
