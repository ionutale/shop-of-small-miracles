import type { CharacterRecord, Tag, VisitRecord } from '../types';

function visit(
	id: string,
	characterId: string,
	chapter: 1 | 2 | 3,
	tags: [Tag, Tag],
	request: string,
	cleanLine: string,
	sideEffectLine: string,
	declineLine: string
): VisitRecord {
	return {
		id,
		characterId,
		chapter,
		tags,
		request,
		cleanLine,
		sideEffectLine,
		declineLine
	};
}

/**
 * Thirty townspeople and sixty-three authored visits. Three are recurring arcs
 * with fixed days; everyone else is drawn from their chapter's pool. A returning
 * face always has new prose and a different request.
 */
export const CHARACTERS: readonly CharacterRecord[] = [
	{
		id: 'widow',
		name: 'The Widow',
		portraitSeed: 12,
		visits: [
			visit(
				'widow-lamp',
				'widow',
				1,
				['Warm', 'Light'],
				'My husband’s lamp went out last winter, and every light since has burned too hot. I need something warm. Something gentle.',
				'It does not burn. It only warms. Thank you, alchemist.',
				'It glows, but it is too bright for my eyes. I will keep it covered.',
				'No. That is not light. But thank you for trying.'
			),
			visit(
				'widow-letters',
				'widow',
				2,
				['Grief', 'Light'],
				'I found my husband’s letters in the lamp cupboard. I would like to read them without the room going dark.',
				'The pages are lit, and the grief is only grief. I can read his hand again.',
				'It is too bright. The words go white at the edges.',
				'No. I will read them by the window, as I always have.'
			),
			visit(
				'widow-chair',
				'widow',
				3,
				['Grief', 'Warm'],
				'There is a chair by the stove that no one has sat in for a year. I want to sit in it without feeling cold.',
				'It is warm, and it is still his chair. I think I can stay.',
				'The warmth smells of someone else’s coat. I will stand a while longer.',
				'No. Some chairs should stay cold a little longer.'
			)
		]
	},
	{
		id: 'merchant',
		name: 'The Salt Merchant',
		portraitSeed: 34,
		visits: [
			visit(
				'merchant-salt',
				'merchant',
				1,
				['Ground', 'Cleanse'],
				'My salt has taken the smell of the road. I need something to clean it and keep it dry, or I have nothing to sell.',
				'It is salt again. The road is gone from it.',
				'It is clean, but it tastes of stone. I can sell it cheap.',
				'Then I will sell it as it is. Road salt has its uses.'
			),
			visit(
				'merchant-road',
				'merchant',
				2,
				['Ground', 'Bitter'],
				'The lower road is mud and bad news. I need something to keep my feet under me and my temper where it belongs.',
				'The mud is only mud now. I can walk it.',
				'It settles my feet and sours my tongue. Fair enough.',
				'No. I have walked worse.'
			),
			visit(
				'merchant-home',
				'merchant',
				3,
				['Warm', 'Bound'],
				'Thirty years I have carried salt. I want to carry something home that stays where I put it.',
				'It holds. I will put it on the kitchen shelf and it will still be there in spring.',
				'It holds too tight. I will have to cut it loose.',
				'Then I will carry what I have. It is enough.'
			)
		]
	},
	{
		id: 'apprentice',
		name: 'The Landlord’s Apprentice',
		portraitSeed: 51,
		visits: [
			visit(
				'apprentice-lamp',
				'apprentice',
				1,
				['Bright', 'Light'],
				'The landlord sends me to count his lamps. I cannot count what I cannot see. Something bright, but not a fire.',
				'I can see all of them. Twelve. He will be pleased, and I will not be burned.',
				'It is bright enough to count, but it hums. I will keep my gloves on.',
				'No. I will count by the window and hope.'
			),
			visit(
				'apprentice-hands',
				'apprentice',
				2,
				['Cleanse', 'Soft'],
				'I have been sitting with the sick in the lower town. I want something that makes my hands feel like mine again.',
				'They are warm and clean and mine. Thank you.',
				'They are clean, but they feel like someone else’s. I will wash them again.',
				'No. I will scrub them by the pump.'
			),
			visit(
				'apprentice-chair',
				'apprentice',
				3,
				['Light', 'Radiant'],
				'The old alchemist’s chair is still in the back room. I want to see it clearly before I decide what to do with it.',
				'It is only a chair. A good one. I think I will keep it.',
				'The light is too much. I can see every crack. Maybe that is what I needed.',
				'No. I will look at it in the morning.'
			)
		]
	},
	{
		id: 'bakers-boy',
		name: 'The Baker’s Boy',
		portraitSeed: 27,
		visits: [
			visit(
				'baker-lantern',
				'bakers-boy',
				1,
				['Bright', 'Warm'],
				'The lane home has no lamps. I need something bright enough to see by, but warm enough to hold.',
				'It is like carrying a summer evening in my pocket.',
				'It hisses a little. But I can see the whole lane.',
				'I will manage in the dark. Goodnight.'
			),
			visit(
				'baker-flour',
				'bakers-boy',
				2,
				['Ground', 'Soft'],
				'The flour has gone heavy in the damp. I need something to make it light again, or there will be no bread tomorrow.',
				'It falls through my fingers like it used to. Bread tomorrow.',
				'It is light, but it smells of the cellar. We will bake it with spice.',
				'Then we will bake it heavy. Heavy bread is still bread.'
			),
			visit(
				'baker-oven',
				'bakers-boy',
				3,
				['Warm', 'Grief'],
				'My mother’s oven has gone cold. I do not want it hot again. I just want it to feel like hers for one morning.',
				'It is warm the way it was when she leaned on it. I can bake here again.',
				'It is hot and strange. I will let it cool before I touch it.',
				'No. I will leave it cold a little longer.'
			)
		]
	},
	{
		id: 'lamplighter',
		name: 'The Lamplighter',
		portraitSeed: 7,
		visits: [
			visit(
				'lamplighter-oil',
				'lamplighter',
				1,
				['Sharp', 'Warm'],
				'The lamp oil will not catch in this wind. I need a flame that starts and stays.',
				'It catches on the first try. The whole lane is lit.',
				'It catches too well. I will keep it away from my coat.',
				'Then I will light them one by one, as slow as the wind likes.'
			),
			visit(
				'lamplighter-fog',
				'lamplighter',
				2,
				['Light', 'Still'],
				'The fog came up from the river and ate the lamplight. I need a light that does not move with it.',
				'It holds. The fog goes around it.',
				'It holds, but it makes the fog brighter. I will walk close to the wall.',
				'No. I will light the near ones and let the far ones wait.'
			),
			visit(
				'lamplighter-last',
				'lamplighter',
				3,
				['Radiant', 'Hollow'],
				'This is my last round before the new boy takes the lamps. I want to leave him something that will not go out.',
				'It will burn for him. That is a good last round.',
				'It burns too bright. He will have to learn to shade it.',
				'Then I will show him the wick and trust him.'
			)
		]
	},
	{
		id: 'seamstress',
		name: 'The Seamstress',
		portraitSeed: 18,
		visits: [
			visit(
				'seamstress-thread',
				'seamstress',
				1,
				['Bound', 'Soft'],
				'The winter coats are coming apart at the seams. I need thread that holds without stiffening.',
				'It holds and it bends. The coats will last the winter.',
				'It holds, but it scratches. I will line the seams.',
				'Then I will use what I have and mend them twice.'
			),
			visit(
				'seamstress-widow',
				'seamstress',
				2,
				['Grief', 'Soft'],
				'I am making a mourning dress for the widow. I want the cloth to be soft enough to be worn, and sad enough to be honest.',
				'It is soft and it remembers. She will wear it.',
				'It is too soft. It falls like a shroud. I will add a lining.',
				'No. I will make it plain and let the cloth speak.'
			),
			visit(
				'seamstress-bright',
				'seamstress',
				3,
				['Bright', 'Bound'],
				'The apprentice is getting married in the lower town. I want a thread that catches the light and does not break.',
				'It shines and it holds. The whole dress will catch the candles.',
				'It shines too much. The bride will look like a lamp. She might like that.',
				'Then I will use silver thread and hope.'
			)
		]
	},
	{
		id: 'ferryman',
		name: 'The Ferryman',
		portraitSeed: 22,
		visits: [
			visit(
				'ferryman-fog',
				'ferryman',
				1,
				['Light', 'Cold'],
				'The river is fog all the way across. I need a light that will not go out in the wet.',
				'It burns cold and clear. I can see the far bank.',
				'It burns, but it steams. I will keep it low in the boat.',
				'Then I will pole by memory. The river knows me.'
			),
			visit(
				'ferryman-sick',
				'ferryman',
				2,
				['Cleanse', 'Ground'],
				'The lower town is sick and the ferry carries them across. I need something to keep the boat clean.',
				'The boards are clean. I can carry them without carrying it home.',
				'It is clean, but the wood drinks it and goes dark.',
				'Then I will scrub the boards with river water.'
			),
			visit(
				'ferryman-fare',
				'ferryman',
				3,
				['Grief', 'Bound'],
				'I carried a woman across last night and she left her fare on the seat. I want to keep it without it being a debt.',
				'It is only a coin now. I will put it in my pocket and not count it.',
				'It is bound too tight. I will give it to the next poor soul.',
				'No. I will leave it where she left it.'
			)
		]
	},
	{
		id: 'schoolteacher',
		name: 'The Schoolteacher',
		portraitSeed: 41,
		visits: [
			visit(
				'teacher-ink',
				'schoolteacher',
				1,
				['Sharp', 'Ground'],
				'The school ink has gone thick and the children cannot write. I need something to make it flow.',
				'It flows. The children will fill the whole slate.',
				'It flows too well. We will have to blot the pages.',
				'Then we will use charcoal and call it a lesson.'
			),
			visit(
				'teacher-voices',
				'schoolteacher',
				2,
				['Calm', 'Still'],
				'The children are frightened of the coughing in the lower town. I need something that makes the room quiet without making it afraid.',
				'The room is quiet and soft. They can hear each other breathe.',
				'It is too quiet. They keep looking at the door.',
				'No. I will read to them until they stop listening for it.'
			),
			visit(
				'teacher-lamp',
				'schoolteacher',
				3,
				['Light', 'Dreaming'],
				'I want to tell them a story about the old alchemist, but the room is too dark to see their faces.',
				'The light is soft and they are dreaming with their eyes open.',
				'The light makes them sleepy. The story will be short.',
				'Then I will tell it by the window and let the dusk do the work.'
			)
		]
	},
	{
		id: 'herbalist',
		name: 'The Herbalist',
		portraitSeed: 9,
		visits: [
			visit(
				'herbalist-root',
				'herbalist',
				1,
				['Ground', 'Warm'],
				'The roots have come up cold and damp. I need something to draw the warmth back into them.',
				'They are warm and whole. The winter tea will be good.',
				'They are warm, but they have lost their smell. I will use them for poultices.',
				'Then I will dry them by the fire and hope.'
			),
			visit(
				'herbalist-fever',
				'herbalist',
				2,
				['Cleanse', 'Bitter'],
				'The fever in the lower town wants a bitter draught. I need something that cleans the blood and does not lie about it.',
				'It is bitter and clean. They will make a face and get well.',
				'It is too bitter. They will spit it out. I will mix it with honey.',
				'No. I will not pretend it is sweet.'
			),
			visit(
				'herbalist-garden',
				'herbalist',
				3,
				['Calm', 'Radiant'],
				'My garden has gone to seed and I am too tired to be sorry. I want something that makes it feel like a garden again.',
				'It is bright and quiet. I can sit here without wanting to fix it.',
				'It is too bright. The weeds look like flowers. Perhaps they are.',
				'Then I will sit with the weeds and call it a garden.'
			)
		]
	},
	{
		id: 'clockmaker',
		name: 'The Clockmaker',
		portraitSeed: 30,
		visits: [
			visit(
				'clockmaker-spring',
				'clockmaker',
				1,
				['Spark', 'Bound'],
				'A mainspring has snapped in the church clock. I need something with a little life in it that will hold.',
				'It holds and it ticks. The church will not be late.',
				'It holds, but it runs fast. The church will be early.',
				'Then I will make a new spring and lose a day.'
			),
			visit(
				'clockmaker-time',
				'clockmaker',
				2,
				['Still', 'Heavy'],
				'The clock in the square has stopped, and the whole town keeps looking at it. I need something to make it easy to wait.',
				'The stillness is easy. People stop looking at the hands.',
				'It is too heavy. The square feels like a held breath.',
				'No. I will fix the clock instead.'
			),
			visit(
				'clockmaker-gift',
				'clockmaker',
				3,
				['Radiant', 'Bound'],
				'I am making a small clock for the apprentice’s wedding. I want it to shine and to keep time for a long time.',
				'It shines and it holds. It will keep their mornings.',
				'It shines too much. They will see it from the street. That may be the point.',
				'Then I will make it plain and let the ticking be the gift.'
			)
		]
	},
	{
		id: 'gravedigger',
		name: 'The Gravedigger',
		portraitSeed: 13,
		visits: [
			visit(
				'gravedigger-lantern',
				'gravedigger',
				1,
				['Light', 'Ground'],
				'The new graves are down past the wall, and the ground is soft. I need a light that will stay where I put it.',
				'It stays. I can work without holding it.',
				'It stays, but it sinks. I will set it on a stone.',
				'Then I will work by the moon and trust the ground.'
			),
			visit(
				'gravedigger-cold',
				'gravedigger',
				2,
				['Cold', 'Heavy'],
				'The ground has frozen too hard to open. I need something that makes the cold feel less like a door.',
				'The cold is only cold now. I can wait for the thaw.',
				'It is colder. I will go inside and drink something hot.',
				'No. I will wait. The ground will open when it is ready.'
			),
			visit(
				'gravedigger-name',
				'gravedigger',
				3,
				['Grief', 'Still'],
				'There is a stone with no name and I cannot remember who is under it. I want to stand there without the forgetting hurting.',
				'The grief is quiet. I can stand here and not need the name.',
				'It is too quiet. I can hear my own breathing. I will go.',
				'Then I will stand here until I remember.'
			)
		]
	},
	{
		id: 'innkeeper',
		name: 'The Innkeeper',
		portraitSeed: 44,
		visits: [
			visit(
				'innkeeper-stove',
				'innkeeper',
				1,
				['Warm', 'Calm'],
				'The stove in the common room will not hold a steady heat. I need something that keeps the edges off the cold without driving everyone out.',
				'The room is warm and easy. No one is sweating.',
				'It is too warm. The guests are asleep in their chairs. I will open a window.',
				'Then I will feed the stove and let it do what it does.'
			),
			visit(
				'innkeeper-sleep',
				'innkeeper',
				2,
				['Dreaming', 'Soft'],
				'The guests cannot sleep for the coughing next door. I need something that lets them rest without making them dull.',
				'They sleep soft and wake easy. That is all I can ask.',
				'They sleep too soft. One of them slept through the breakfast bell. I will wake them myself.',
				'No. I will put them in the back rooms and hope.'
			),
			visit(
				'innkeeper-room',
				'innkeeper',
				3,
				['Hollow', 'Warm'],
				'There is a room at the top of the stairs that no one wants. I want it to feel empty in a kind way.',
				'It is empty and warm. I can leave the door open.',
				'It is warm, but it echoes. I will put a rug down.',
				'Then I will close the door and let it be.'
			)
		]
	},
	{
		id: 'glassblower',
		name: 'The Glassblower',
		portraitSeed: 36,
		visits: [
			visit(
				'glassblower-crack',
				'glassblower',
				1,
				['Sharp', 'Cleanse'],
				'A crack has run through the church window. I need something to clean the edges so the new pane will sit true.',
				'The edges are clean and sharp. The pane will hold.',
				'It is clean, but the glass sings. The vicar will not like it.',
				'Then I will grind the edges by hand.'
			),
			visit(
				'glassblower-breath',
				'glassblower',
				2,
				['Bright', 'Calm'],
				'I have been breathing the furnace all week and my hands are shaking. I need something bright and steady.',
				'The glass goes where I look. My hands are quiet.',
				'It is bright, but my hands are too calm. I will stop before I drop it.',
				'No. I will sit by the door until the shaking stops.'
			),
			visit(
				'glassblower-bell',
				'glassblower',
				3,
				['Radiant', 'Hollow'],
				'I am making a bell for the lower town. I want it to ring clear and have room inside for the sound.',
				'It rings and the sound has somewhere to go. They will hear it across the river.',
				'It rings too bright. It will hurt the ears. I will make the next one smaller.',
				'Then I will make it thick and let it be a dull bell.'
			)
		]
	},
	{
		id: 'fisher',
		name: 'The Fisher',
		portraitSeed: 3,
		visits: [
			visit(
				'fisher-line',
				'fisher',
				1,
				['Bound', 'Still'],
				'My line keeps drifting in the current. I need something that holds it quiet.',
				'The line holds still. I can feel the bottom.',
				'It holds too still. The river feels asleep. I will fish shallow.',
				'Then I will use a heavier stone.'
			),
			visit(
				'fisher-catch',
				'fisher',
				2,
				['Cold', 'Bright'],
				'The fish have gone deep and the water is dark. I need something cold and bright enough to see them.',
				'The water is cold and clear. I can see the whole school.',
				'It is too bright. The fish go deeper. I will wait for dusk.',
				'No. I will fish the shallows and take what comes.'
			)
		]
	},
	{
		id: 'midwife',
		name: 'The Midwife',
		portraitSeed: 16,
		visits: [
			visit(
				'midwife-sleep',
				'midwife',
				1,
				['Dreaming', 'Calm'],
				'The mother upstairs cannot sleep for listening. I need something that lets her rest without making her slow.',
				'She sleeps calm and wakes sharp. The baby will come when it comes.',
				'She sleeps too deep. I will sit with her and wake her for the next pain.',
				'Then I will sit with her and count the hours.'
			),
			visit(
				'midwife-hands',
				'midwife',
				2,
				['Cleanse', 'Warm'],
				'I have been in the lower town all night. I want my hands warm and clean before I touch another door.',
				'They are warm and clean. I can knock.',
				'They are clean, but they sting. I will wrap them.',
				'No. I will wash at the pump and go on.'
			)
		]
	},
	{
		id: 'cobbler',
		name: 'The Cobbler',
		portraitSeed: 25,
		visits: [
			visit(
				'cobbler-sole',
				'cobbler',
				1,
				['Ground', 'Bound'],
				'The children’s boots are coming apart and the lane is all stones. I need something that holds a sole to a foot.',
				'It holds. They can run the lane without losing a boot.',
				'It holds too hard. I will have to cut them off. I will make the next pair bigger.',
				'Then I will stitch them twice and hope for a dry week.'
			),
			visit(
				'cobbler-road',
				'cobbler',
				2,
				['Heavy', 'Ground'],
				'The salt road has worn through my best pair. I need something that makes the road feel less long.',
				'The road is heavy but it does not pull. I can walk to the market.',
				'It is too heavy. I will stop at the ford and rest.',
				'No. I will walk barefoot to the ford and put them on after.'
			)
		]
	},
	{
		id: 'stationer',
		name: 'The Stationer',
		portraitSeed: 5,
		visits: [
			visit(
				'stationer-ink',
				'stationer',
				1,
				['Bitter', 'Ground'],
				'The ink has frozen in the bottles. I need something bitter enough to keep it moving.',
				'It flows black and bitter. The ledgers can be written.',
				'It flows, but it eats the paper. I will use it for wrapping.',
				'Then I will warm the bottles in my coat.'
			),
			visit(
				'stationer-letter',
				'stationer',
				2,
				['Grief', 'Light'],
				'A letter came for the widow and I do not want to hand it to her in the dark. I need something to carry with it.',
				'The light is small and sad. She will be able to read it.',
				'It is too bright. She will see the seal before she sees me.',
				'Then I will leave it on her step and knock.'
			)
		]
	},
	{
		id: 'beekeeper',
		name: 'The Beekeeper',
		portraitSeed: 19,
		visits: [
			visit(
				'beekeeper-smoke',
				'beekeeper',
				1,
				['Still', 'Spark'],
				'The bees are restless and the smoke will not settle them. I need something that calms them without putting them to sleep.',
				'The hive goes quiet and stays awake. They will keep working.',
				'They sleep too long. I will lose a day of honey.',
				'Then I will wait for the cold and move them at dusk.'
			),
			visit(
				'beekeeper-honey',
				'beekeeper',
				2,
				['Warm', 'Radiant'],
				'The honey has gone cloudy in the cold. I want it to look like summer again.',
				'It is clear and warm. It looks like the field it came from.',
				'It is too bright. It tastes of metal. I will keep it for medicine.',
				'No. Cloudy honey is still honey.'
			)
		]
	},
	{
		id: 'mason',
		name: 'The Mason',
		portraitSeed: 28,
		visits: [
			visit(
				'mason-mortar',
				'mason',
				1,
				['Bound', 'Heavy'],
				'The mortar will not set in this wet. I need something that makes it hold before the frost.',
				'It sets hard and true. The wall will stand.',
				'It sets too fast. I lost half a course. I will chip it out.',
				'Then I will cover the wall and wait for a dry day.'
			),
			visit(
				'mason-wall',
				'mason',
				2,
				['Ground', 'Still'],
				'The lower town wall is leaning and the ground is soft. I need something to make it remember where it stands.',
				'The wall is still and the ground holds. It will not lean today.',
				'It is too still. The wall feels like it is listening. I will brace it anyway.',
				'No. I will shore it with timber and pray for frost.'
			)
		]
	},
	{
		id: 'night-watch',
		name: 'The Night Watch',
		portraitSeed: 38,
		visits: [
			visit(
				'watch-dark',
				'night-watch',
				1,
				['Light', 'Cold'],
				'The watch fire will not carry past the gate. I need a light that stays cold enough to hold.',
				'It burns cold and steady. I can see the whole road.',
				'It is too cold. My fingers stick to the handle. I will wrap it.',
				'Then I will walk the near wall and let the far one sleep.'
			),
			visit(
				'watch-sleep',
				'night-watch',
				2,
				['Dreaming', 'Still'],
				'I cannot sleep in the day for the noise of the town. I need something that makes the daylight quiet.',
				'The day goes quiet and I sleep without dreams. I wake at dusk.',
				'I sleep too still. They had to shake me awake. I will set two alarms.',
				'Then I will sleep in the bell tower and let the bells do what they do.'
			)
		]
	},
	{
		id: 'butcher',
		name: 'The Butcher',
		portraitSeed: 11,
		visits: [
			visit(
				'butcher-cold',
				'butcher',
				1,
				['Cold', 'Sharp'],
				'The cold room has gone warm and the meat will not keep. I need something sharp and cold that does not freeze the lock.',
				'It is cold and clean. The meat will keep until market day.',
				'It is too cold. The lock has frozen. I will leave it open.',
				'Then I will sell what I can and salt the rest.'
			)
		]
	},
	{
		id: 'milkmaid',
		name: 'The Milkmaid',
		portraitSeed: 14,
		visits: [
			visit(
				'milkmaid-sour',
				'milkmaid',
				2,
				['Cleanse', 'Bitter'],
				'The milk has turned in the churn. I need something that makes it clean without making it sweet.',
				'It is clean and a little bitter. The cheese will be good.',
				'It is too bitter. The calves will drink it. I will not.',
				'Then I will pour it on the garden and start again.'
			)
		]
	},
	{
		id: 'bookbinder',
		name: 'The Bookbinder',
		portraitSeed: 21,
		visits: [
			visit(
				'bookbinder-glue',
				'bookbinder',
				3,
				['Bound', 'Warm'],
				'The old alchemist’s ledger is coming apart. I want the pages to stay together without making them stiff.',
				'The spine holds and the pages turn. The ledger can be read.',
				'It holds too tight. The pages will not open flat. I will loosen it.',
				'Then I will sew it by hand and let it be imperfect.'
			)
		]
	},
	{
		id: 'gardener',
		name: 'The Gardener',
		portraitSeed: 23,
		visits: [
			visit(
				'gardener-frost',
				'gardener',
				3,
				['Warm', 'Ground'],
				'The frost came early and the beds are hard. I want to put my hands in the earth one more time before winter.',
				'The ground is warm and soft. I can plant the last bulbs.',
				'It is too warm. The bulbs will think it is spring. I will cover them.',
				'Then I will wait for the thaw and plant in the mud.'
			)
		]
	},
	{
		id: 'chimney-sweep',
		name: 'The Chimney Sweep',
		portraitSeed: 31,
		visits: [
			visit(
				'sweep-soot',
				'chimney-sweep',
				3,
				['Cleanse', 'Hollow'],
				'I have been up the chimneys all week and I cannot get the soot out of my chest. I want to breathe empty again.',
				'My chest is clear and quiet. I can go up one more.',
				'It is too empty. I can hear the wind in me. I will sit by the fire.',
				'No. I will cough it out by the river.'
			)
		]
	},
	{
		id: 'cartwright',
		name: 'The Cartwright',
		portraitSeed: 39,
		visits: [
			visit(
				'cartwright-wheel',
				'cartwright',
				3,
				['Bound', 'Heavy'],
				'The salt cart has lost a wheel and the road is waiting. I need something that holds the axle true.',
				'The wheel holds and the cart rolls straight. The road can have it.',
				'It holds too heavy. The horse will feel it. I will lighten the load.',
				'Then I will cut a new axle and lose a day.'
			)
		]
	},
	{
		id: 'weaver',
		name: 'The Weaver',
		portraitSeed: 42,
		visits: [
			visit(
				'weaver-pattern',
				'weaver',
				3,
				['Still', 'Bright'],
				'The pattern in the church cloth has gone crooked and I cannot see where it turned. I want it to be still enough to read.',
				'The pattern is still and bright. I can see where it turned.',
				'It is too bright. The threads look like they are moving. I will weave by daylight.',
				'Then I will unpick it and start from the edge.'
			)
		]
	},
	{
		id: 'cooper',
		name: 'The Cooper',
		portraitSeed: 45,
		visits: [
			visit(
				'cooper-barrel',
				'cooper',
				3,
				['Bound', 'Ground'],
				'The barrel for the lower town well will not hold. I need something that makes the staves remember the ground.',
				'The staves hold and the barrel is true. The well will have water.',
				'It holds too tight. The wood has split at the rim. I will bind it with iron.',
				'Then I will make a smaller barrel and carry it myself.'
			)
		]
	},
	{
		id: 'stray-child',
		name: 'The Child Under the Stairs',
		portraitSeed: 8,
		visits: [
			visit(
				'child-light',
				'stray-child',
				3,
				['Light', 'Dreaming'],
				'I am not supposed to be out. I want a light for under the stairs so the dark is not so big.',
				'The light is small and sleepy. The dark is only a cupboard now.',
				'It is too bright. My mother will see it from the window. I will hide it under my coat.',
				'Then I will leave the door open a little.'
			)
		]
	},
	{
		id: 'old-soldier',
		name: 'The Old Soldier',
		portraitSeed: 49,
		visits: [
			visit(
				'soldier-sleep',
				'old-soldier',
				3,
				['Dreaming', 'Heavy'],
				'I have not slept without hearing the road for thirty years. I want one heavy, dreamless night.',
				'I sleep heavy and dream of nothing. I wake in the same room.',
				'I sleep too heavy. I do not hear the door. I will bolt it before I drink.',
				'No. I will sit by the window and keep watch.'
			)
		]
	}
];

export const VISITS: readonly VisitRecord[] = CHARACTERS.flatMap((character) => character.visits);

const VISIT_BY_ID = new Map(VISITS.map((visit) => [visit.id, visit]));
const CHARACTER_BY_ID = new Map(CHARACTERS.map((character) => [character.id, character]));

export function visitById(id: string | null): VisitRecord | null {
	if (!id) return null;
	return VISIT_BY_ID.get(id) ?? null;
}

export function characterById(id: string): CharacterRecord | null {
	return CHARACTER_BY_ID.get(id) ?? null;
}
