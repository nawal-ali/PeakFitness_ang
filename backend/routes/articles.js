const express = require("express");
const router = express.Router();
const { Article, User } = require('../models');

// get all articles
router.get("/", async (req, res) => {
    try {
        const articles = await Article.find();
        res.json({ number: articles.length, articles });
    } catch (err) {
        console.error("Error fetching articles:", err);
        res.status(500).json({ error: "Failed to fetch articles" });
    }
});


// get article by id
router.get("/:id", async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }
        res.json(article);
    } catch (err) {
        console.error("Error fetching article:", err);
        res.status(500).json({ error: "Failed to fetch article" });
    }
});

// create new article
router.post("/", async (req, res) => {
    try {
        const { title, content, author, coverImg, desc } = req.body;
        const newArticle = new Article({ title, content, author, coverImg, desc });
        await newArticle.save();
        res.status(201).json(newArticle);
    } catch (err) {
        console.error("Error creating article:", err);
        res.status(500).json({ error: "Failed to create article" });
    }
});


//get the likes
// router.post('/:id/like', async (req, res) => {
//     try {
//         const article = await Article.findById(req.params.id);
//         if (!article) {
//             return res.status(404).send({ message: 'Article not found' });
//         }

//         const userId = req.user._id;
//         const likeIndex = article.likes.indexOf(userId);

//         if (likeIndex === -1) {
//             // Like the article
//             article.likes.push(userId);
//         } else {
//             // Unlike the article
//             article.likes.splice(likeIndex, 1);
//         }

//         article.likesCount = article.likes.length;
//         await article.save();

//         res.send({
//             likes: article.likes,
//             likesCount: article.likesCount
//         });
//     } catch (error) {
//         res.status(500).send({ message: 'Error updating like status', error });
//     }
// });

router.post('/:id/like', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).send({ message: 'Article not found' });
        }

        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).send({ message: 'User ID is required' });
        }

        const likeIndex = article.likes.indexOf(userId);

        if (likeIndex === -1) {
            // Like the article
            article.likes.push(userId);
        } else {
            // Unlike the article
            article.likes.splice(likeIndex, 1);
        }

        article.likesCount = article.likes.length;
        await article.save();

        res.send({
            likes: article.likes,
            likesCount: article.likesCount
        });
    } catch (error) {
        res.status(500).send({ message: 'Error updating like status', error });
    }
});


//edit article
// router.put("/:id", async (req, res) => {
//     try {
//         const { title, content } = req.body;
//         const updatedArticle = await Article.findByIdAndUpdate(
//             req.params.id,
//             { title, content },
//             { new: true }
//         );
//         if (!updatedArticle) {
//             return res.status(404).json({ error: "Article not found" });
//         }
//         res.json(updatedArticle);
//     } catch (err) {
//         console.error("Error updating article:", err);
//         res.status(500).json({ error: "Failed to update article" });
//     }
// });

//update Specific Section
// PATCH /api/articles/:id/section/:sectionIndex
router.patch("/:id/section/:sectionIndex", async (req, res) => {
    try {
        const { id, sectionIndex } = req.params;
        const { subtitle, paragraphs, images } = req.body;

        const article = await Article.findById(id);
        if (!article) return res.status(404).json({ error: "Article not found" });

        const index = parseInt(sectionIndex);
        if (!article.content[index]) return res.status(404).json({ error: "Section not found" });

        if (subtitle !== undefined) article.content[index].subtitle = subtitle;
        if (paragraphs !== undefined) article.content[index].paragraphs = paragraphs;
        if (images !== undefined) article.content[index].images = images;

        await article.save();
        res.json({ message: "Section updated", article });
    } catch (err) {
        console.error("Error updating section:", err);
        res.status(500).json({ error: "Failed to update section" });
    }
});

//Update a Specific Paragraph Only (by index)
// PATCH /api/articles/:id/section/:sectionIndex/paragraph/:paragraphIndex
router.patch("/:id/section/:sectionIndex/paragraph/:paragraphIndex", async (req, res) => {
    try {
        const { id, sectionIndex, paragraphIndex } = req.params;
        const { text } = req.body;

        const article = await Article.findById(id);
        if (!article) return res.status(404).json({ error: "Article not found" });

        const secIdx = parseInt(sectionIndex);
        const paraIdx = parseInt(paragraphIndex);

        if (!article.content[secIdx]) return res.status(404).json({ error: "Section not found" });
        if (!article.content[secIdx].paragraphs[paraIdx]) return res.status(404).json({ error: "Paragraph not found" });

        article.content[secIdx].paragraphs[paraIdx] = text;

        await article.save();
        res.json({ message: "Paragraph updated", article });
    } catch (err) {
        console.error("Error updating paragraph:", err);
        res.status(500).json({ error: "Failed to update paragraph" });
    }
});

//Update a Specific Image Caption
// PATCH /api/article/:id/section/:sectionIndex/image/:imageIndex
router.patch("/:id/section/:sectionIndex/image/:imageIndex", async (req, res) => {
    try {
        const { id, sectionIndex, imageIndex } = req.params;
        const { caption, url } = req.body;

        const article = await Article.findById(id);
        if (!article) return res.status(404).json({ error: "Article not found" });

        const secIdx = parseInt(sectionIndex);
        const imgIdx = parseInt(imageIndex);

        if (!article.content[secIdx]) return res.status(404).json({ error: "Section not found" });
        if (!article.content[secIdx].images[imgIdx]) return res.status(404).json({ error: "Image not found" });

        article.content[secIdx].images[imgIdx].caption = caption;
        article.content[secIdx].images[imgIdx].url = url;

        await article.save();
        res.json({ message: "Image updated successfully", article });
    } catch (err) {
        console.error("Error updating image:", err);
        res.status(500).json({ error: "Failed to update image" });
    }
});

//edit article cover img
// PATCH /api/article/:id/cover
router.patch("/:id/cover", async (req, res) => {
    try {
        const { id } = req.params;
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }
        article.coverImg.url = url;
        await article.save();
        res.json({ message: "Cover image updated successfully", article });
    } catch (err) {
        console.error("Error updating cover image:", err);
        res.status(500).json({ error: "Failed to update cover image" });
    }
});

//edit desc
router.patch("/:id/desc", async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "URL is required" });
        }

        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }

        article.desc = text;
        await article.save();

        res.json({ message: "description updated successfully", article });
    } catch (err) {
        console.error("Error updating cover image:", err);
        res.status(500).json({ error: "Failed to update description" });
    }
});

// edite author
router.patch("/:id/author", async (req, res) => {
    try {
        const { id } = req.params;
        const { authorId } = req.body;

        if (!authorId) {
            return res.status(400).json({ error: "Author ID is required" });
        }

        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }

        const author = await User.findById(authorId);
        if (!author) {
            return res.status(404).json({ error: "Author not found" });
        }

        article.author = authorId;
        await article.save();

        res.json({ message: "Author updated successfully", article });
    } catch (err) {
        console.error("Error updating author:", err);
        res.status(500).json({ error: "Failed to update author" });
    }
});

// delete article
router.delete("/:id", async (req, res) => {
    try {
        const deletedArticle = await Article.findByIdAndDelete(req.params.id);
        if (!deletedArticle) {
            return res.status(404).json({ error: "Article not found" });
        }
        res.json({ message: "Article deleted successfully" });
    } catch (err) {
        console.error("Error deleting article:", err);
        res.status(500).json({ error: "Failed to delete article" });
    }
});

module.exports = router;