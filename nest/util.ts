import { Injectable } from "@nestjs/common";

@Injectable()
export class UtilService {
    formatStats(reviews, slice = false) {
        const total = reviews.reduce((agg, review) => {
            agg += review.count;
            return agg;
        }, 0);
        const result = reviews.map((review) => {
            const percentage = (review.count / total) * 100;
            return {
                _id: review._id,
                percentage: percentage.toFixed(0),
                count: review.count,
            };
        });
        return { total, reviews: slice ? result.slice(0, 3) : result };
    }

    /**
     * https://medium.com/javascript-in-plain-english/javascript-merge-duplicate-objects-in-array-of-objects-9a76c3a1c35c
     * @param array
     * @param property
     */
    mergeObjectsInUnique<T>(array: T[], property: any): T[] {
        const newArray = new Map();

        array.forEach((item: T) => {
            const propertyValue = item[property];
            newArray.has(propertyValue)
                ? newArray.set(propertyValue, {
                      ...item,
                      ...newArray.get(propertyValue),
                  })
                : newArray.set(propertyValue, item);
        });

        return Array.from(newArray.values());
    }
}
