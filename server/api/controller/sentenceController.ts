import ClaimRepository from "../repository/claim";
import { ILogger } from "../../lib/loggerInterface";
import ClaimReviewRepository from "../repository/claimReview";

export default class SentenceController {
    private claimReviewRepository: ClaimReviewRepository;
    private claimRepository: ClaimRepository;
    logger: ILogger;

    constructor({ logger }) {
        this.logger = logger;
        this.claimRepository = new ClaimRepository(logger);
        this.claimReviewRepository = new ClaimReviewRepository(logger);
    }

    getByHashAndClaimId(sentenceHash, claimId, user) {
        return Promise.all([
            this.claimReviewRepository.getReviewStatsBySentenceHash(
                sentenceHash
            ),
            this.claimRepository.getById(claimId),
            this.claimReviewRepository.getUserReviewBySentenceHash(
                sentenceHash,
                user?._id
            ),
        ]).then(([stats, claimObj, userReview]) => {
            let sentenceObj;

            claimObj.content.object.forEach((p) => {
                p.content.forEach((sentence) => {
                    if (sentence.props["data-hash"] === sentenceHash) {
                        sentenceObj = sentence;
                    }
                });
            });
            return {
                userReview,
                date: claimObj.date,
                personality: claimObj.personality,
                stats,
                ...sentenceObj,
            };
        });
    }

    getReviewsByClaimIdAndSentenceHash(
        sentenceHash,
        page,
        pageSize,
        order = "desc"
    ) {
        return Promise.all([
            this.claimReviewRepository.getReviewsBySentenceHash(
                sentenceHash,
                page,
                pageSize,
                order
            ),
            this.claimReviewRepository.countReviewsBySentenceHash(sentenceHash),
        ]).then(([reviews, totalReviews]) => {
            totalReviews = totalReviews[0]?.count;
            const totalPages = Math.ceil(totalReviews / parseInt(pageSize, 10));

            this.logger.log(
                "info",
                `Found ${totalReviews} reviews for sentence hash ${sentenceHash}. Page ${page} of ${totalPages}`
            );

            return {
                reviews,
                totalReviews,
                totalPages,
                page,
                pageSize,
            };
        });
    }
}
