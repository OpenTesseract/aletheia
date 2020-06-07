const axios = require("axios");

const wbclaims = {
    image: "P18",
    twitter: "P2002"
};

module.exports = class WikidataResolver {
    async fetchProperties(params) {
        const { data } = await axios.get("https://www.wikidata.org/w/api.php", {
            params: {
                action: "wbgetentities",
                ids: encodeURIComponent(params.wikidataId),
                format: "json",
                formatversion: "2"
            }
        });
        const entities = data && data.entities;
        return this.extractProperties(
            entities && entities[params.wikidataId],
            params.language
        );
    }

    async extractProperties(wikidata, lang = "en") {
        const wikidataProps = {};
        if (!wikidata) {
            return {};
        }
        const { labels, descriptions, claims } = wikidata;

        // Get label for the personality name
        wikidataProps.name = labels && labels[lang] && labels[lang].value;

        // Get description for the personality description
        wikidataProps.description =
            descriptions && descriptions[lang] && descriptions[lang].value;

        if (claims) {
            for (const property of Object.keys(wbclaims)) {
                wikidataProps[property] = await this.extractClaimProperty(
                    claims[wbclaims[property]],
                    property
                );
            }
        }

        return wikidataProps;
    }

    async extractClaimProperty(wbproperty, property) {
        if (!wbproperty) {
            return;
        }
        switch (property) {
            case "image":
                // eslint-disable-next-line no-case-declarations
                const fileName = wbproperty[0].mainsnak.datavalue.value;
                return await this.getCommonsThumbURL(fileName);
                break;
            case "twitter":
                return wbproperty.map(p => {
                    return p.mainsnak.datavalue.value;
                });
                break;
        }
    }

    async getCommonsThumbURL(imageTitle) {
        const { data } = await axios.get(
            "https://commons.wikimedia.org/w/api.php",
            {
                params: {
                    action: "query",
                    titles: `File:${imageTitle}`,
                    prop: "imageinfo",
                    iiprop: "url",
                    iiurlwidth: 400,
                    format: "json",
                    formatversion: "2"
                }
            }
        );
        const { pages } = data && data.query;
        if (pages.length <= 0) {
            return;
        }
        const imageinfo =
            pages[0] && pages[0].imageinfo && pages[0].imageinfo[0];
        return imageinfo.url;
    }
};
