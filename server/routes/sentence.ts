import { Request, Response } from "express";
const ClaimReview = require("../api/model/claimReviewModel");

/**
 * The main router object
 */
const router = require("../lib/util").router();

/**
 * GET {domain}/sentence/:sentencehash
 */
router.get("/:sentenceHash", (req: Request, res: Response) => {
    const { sentenceHash } = req.params;
    ClaimReview.aggregate([
        { $match: { sentenceHash } },
        { $group: { _id: "$classification", count: { $sum: 1 } } }
    ]).then(review => {
        res.json(review);
    });
});

/**
 * GET {domain}/sentence
 * Ordered by most recent
 * Randomized? One per personality?
 */
router.get("/", (req: Request, res: Response) => {
    // TODO: allow limit parameter
    // TODO: move business logic to the repository layer
    // TODO: order by most recent
    ClaimReview.aggregate([
        {
            $group: {
                _id: {
                    sentence_hash: "$sentence_hash",
                    personality: "$personality"
                },
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "personalities",
                localField: "_id.personality",
                foreignField: "_id",
                as: "personality"
            }
        }
    ])
        .limit(10)
        .then((review: any) => {
            res.json(review);
        });
});

module.exports = function(appObj) {
    return {
        path: "/sentence",
        api_version: 1,
        router
    };
};
