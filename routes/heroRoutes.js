const express = require('express');
const router = express.Router();

const Hero = require('../schemas/heroSchema');

//Add New Hero // OK
router.put('/addHero', async (req, res) => {
    try{
      const newHero = new Hero({
        name: req.body.name,
        role: req.body.role,
        description: req.body.description,
        abilities: req.body.abilities,
        stats: req.body.stats
      });
      const savedHero = newHero.save();
      res.status(200).json(
        {
          success: true,
          result: {
            hero: savedHero
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
          result: {
            message: error.message
        }
      });
      // handle errors here
    }
    
});
// Get All Hero // OK
router.get('/getAllHeroes', async (req, res) => {
const heros = await Hero.find();
res.status(200).json(
    {
    success: true,
    result: {
        heros: heros
    }
});
});
// Get Single Hero By ID // OK
router.get('/getHeroByID', async (req, res) => {
const hero = await Hero.findById(req.query.id);
if (!hero) return res.status(404).send({
    success: false,
    result: {
    message: "Hero Not Found!"
}});
res.send({
    success: true,
    result: {
    hero: hero
    }
});
});

module.exports = router;