const t = require('..')
module.exports = {
  name: "random-element",
  aliases: ['randomelement'],
  description: {en:'retruns a random element.'},
  cooldown: 2,
  translations: {
    elements: {
      en: [
        "Hydrogen", "Helium ", "Lithium", "Beryllium", "Boron", "Carbon", "Nitrogen", "Oxygen", "Fluorine", "Neon", "Sodium", "Magnesium", "Aluminum", "Silicon", "Phosphrous", "Sulphur", "Chlorine", "Argon", "Potassium", "Calcium", "Scandium", "Titanium", "Vanadium", "Chromium", "Manganese", "Iron", "Cobalt", "Nickel", "Copper", "Zinc", "Gallium", "Germanium", "Arsenic", "Selenium", "Bromine", "Krypton", "Rubidium", "Stronium", "Yttrium", "Zironium", "Niobium", "Molybdenum", "Technetium", "Ruthenium", "Rhodium", "Palladium", "Silver", "Candmium", "Indium", "Tin", "Antimony", "Tellurium", "Iodine", "Xenon", "Caesium", "Barium", "Lanthanum", "Cerium", "Praseodymium", "Neodymium", "Promethium", "Samarium", "Europium", "Gadolinium", "Terbium", "Dysprosium", "Holonium", "Erbium", "Thulium", "Ytterium", "Lutetium", "Hafnium", "Tantalum", "Tungsten", "Rhenium", "Osmium", "Iridium", "Platnium", "Gold", "Mercury", "Thallium", "Lead", "Bismuth", "Polonium", "Astatine", "Radon", "Francium", "Radium", "Actnium", "Thorium", "Protactium", "Uranium", "Neptunium", "Plutonium", "Americium", "Curium", "Berklium", "Californiium", "Eistenium", "Fermium", "Mendelevium", "Nobelium", "Lawrencium", "Rutherfordium", "Dubnium", "Seaborgium", "Bohrium", "Hassium", "Meitnerium", "Darmstadtium", "Roentgenium", "Copernicium", "Nihonium", "Flevorium", "Moscovium", "Livermorium", "Tennessine", "Oganesson"
      ]
    }
  }, execute: async (message, args) => {
    const result =  t('commands.random-element.elements',message.client,message.guild)[Math.floor(Math.random() * t('commands.random-element.elements',message.client,message.guild).length)];
    message.channel.send(result);
  }
}