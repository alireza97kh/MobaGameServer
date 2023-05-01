const express = require('express');
const router = express.Router();

const Item = require('../schemas/itemSchema');


//Add New Items // OK
router.put('/addItems', async (req, res) => {
    try{
      const newItem = new Item({
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        rarity: req.body.rarity,
        stats: req.body.stats
        // cost: req.body.cost,
        // effects: req.body.effects,
      });
      const savedItem = newItem.save();
      res.status(200).json(
        {
          success: true,
          result: {
            item: savedItem
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
// Get All Items // OK
router.get('/getAllItems', async (req, res) => {
const items = await Item.find();
res.status(200).json(
    {
    success: true,
    result: {
        items: items
    }
});
});
// Get Single Item By ID // OK
router.get('/getItemByID', async (req, res) => {
const item = await Item.findById(req.query.id);
if (!item) return res.status(404).send({
    success: false,
    result: {
    message: "Item Not Found!"
}});
res.send({
    success: true,
    result: {
    item: item
    }
});
});

module.exports = router;