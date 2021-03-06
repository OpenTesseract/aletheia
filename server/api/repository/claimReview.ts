import { ILogger } from "../../lib/loggerInterface";

const util = require("../../lib/util");
const ClaimReview = require("../model/claimReviewModel");
const Claim = require("../model/claimModel");
const Source = require("../model/sourceModel");

/**
 * @class ClaimReviewRepository
 */
export default class ClaimReviewRepository {
    optionsToUpdate: Object;
    logger: ILogger;

    constructor(logger: any = {}) {
        this.logger = logger;
        this.optionsToUpdate = {
            new: true,
            upsert: true,
        };
    }

    listAll() {
        return ClaimReview.find({}).lean();
    }

    async create(claimReview) {
        const newClaimReview = new ClaimReview(claimReview);
        if (claimReview.source) {
            const source = new Source({
                link: claimReview.source,
                targetId: newClaimReview.id,
                targetModel: "ClaimReview",
            });
            await source.save();
            newClaimReview.sources = [source];
        }

        return newClaimReview.save((err, review) => {
            if (err) {
                throw err;
            }
            Claim.findOneAndUpdate(
                { _id: claimReview.claim },
                { $push: { claimReviews: review } },
                { new: true },
                (e) => {
                    if (e) {
                        throw e;
                    }
                }
            );
        });
    }

    getById(claimReviewId) {
        return ClaimReview.findById(claimReviewId)
            .populate("claims", "_id title")
            .populate("sources", "_id link classification");
    }

    _topClassificationAccumulator() {
        return {
            $accumulator: {
                init: function () {
                    return {};
                },
                accumulate: function (state, classification) {
                    if (!state[classification]) {
                        state[classification] = 1;
                    } else {
                        state[classification]++;
                    }

                    return state;
                },
                accumulateArgs: ["$classification"],
                merge: function (state1, state2) {
                    return { ...state1, ...state2 };
                },
                finalize: function (state) {
                    // Find the classification with bigger count
                    const topClassification = Object.keys(state).reduce(
                        (acc, classification) => {
                            if (!state[acc]) {
                                return classification;
                            } else {
                                return state[acc] >= state[classification]
                                    ? acc
                                    : classification;
                            }
                        },
                        ""
                    );
                    // TODO: what can we do about ties?
                    return {
                        classification: topClassification,
                        count: state[topClassification],
                    };
                },
                lang: "js",
            },
        };
    }

    getReviewsByClaimId(claimId) {
        return ClaimReview.aggregate([
            { $match: { claim: claimId } },
            {
                $group: {
                    _id: "$sentence_hash",
                    topClassification: this._topClassificationAccumulator(),
                },
            },
        ]).option({ serializeFunctions: true });
    }

    _reviewsBySentenceHashAggregated(sentenceHash) {
        return ClaimReview.aggregate([
            { $match: { sentence_hash: sentenceHash } },
            {
                $project: {
                    _id: 1,
                    sources: 1,
                    classification: 1,
                    user: 1,
                },
            },
        ]);
    }

    countReviewsBySentenceHash(sentenceHash) {
        return this._reviewsBySentenceHashAggregated(sentenceHash).count(
            "count"
        );
    }

    getReviewsBySentenceHash(sentenceHash, page, pageSize, order) {
        pageSize = parseInt(pageSize);
        page = parseInt(page);

        return this._reviewsBySentenceHashAggregated(sentenceHash)
            .skip(page * pageSize)
            .limit(pageSize)
            .sort({ _id: order });
    }

    async getReviewStatsBySentenceHash(sentenceHash) {
        const reviews = await ClaimReview.aggregate([
            { $match: { sentence_hash: sentenceHash } },
            { $group: { _id: "$classification", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        return util.formatStats(reviews);
    }

    async getReviewStatsByClaimId(claimId) {
        const reviews = await ClaimReview.aggregate([
            { $match: { claim: claimId } },
            { $group: { _id: "$classification", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        return util.formatStats(reviews);
    }

    async update(claimReviewId, claimReviewBody) {
        // eslint-disable-next-line no-useless-catch
        try {
            const claimReview = await this.getById(claimReviewId);
            const newClaimReview = Object.assign(claimReview, claimReviewBody);
            const claimReviewUpdate = await ClaimReview.findByIdAndUpdate(
                claimReviewId,
                newClaimReview,
                this.optionsToUpdate
            );
            return claimReviewUpdate;
        } catch (error) {
            // TODO: log to service-runner
            throw error;
        }
    }

    delete(claimReviewId) {
        return ClaimReview.findByIdAndRemove(claimReviewId);
    }

    getUserReviewBySentenceHash(sentenceHash, userId) {
        if (!userId) {
            return Promise.resolve(undefined);
        }
        return ClaimReview.findOne(
            { sentence_hash: sentenceHash, user: userId },
            {
                sources: 1,
                _id: 1,
                classification: 1,
                user: 1,
            }
        );
    }
}
