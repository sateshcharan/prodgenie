export const bomSetupPrompt =
  "from this file identify all the headers for bom, titleBlock and printingDetial and return it in a json form also change each field to camelCase and don't include any entries";

export const extractBOMPrompt = 'extract from drawing in this format // {"bom": [{"qty": "1", "slNo": "1", "width": "520.00", "height": "410.00", "length": "580.00", "material": "7 Ply", "strength": "16 BF", "description": "RSC", "specification": "140/140/140/140/140/140/140"}], "titleBlock": {"dwgNo": "ADW-11-21-253", "customerName": "CMS", "productDetail": "Consumables box"}, "printingDetails": [{"printingColour": "Black", "printingDetail": "CMS Logo", "printingLocation": "Length"}, {"printingColour": "Black", "printingDetail": "Fragile", "printingLocation": "Width"}]}';
