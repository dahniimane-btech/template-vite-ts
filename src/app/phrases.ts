import type { Phrase } from './types';

// Banque de phrases niveau B1+ (espagnol / français).
// Ajoute librement de nouvelles entrées ici : elles seront automatiquement
// intégrées dans la génération quotidienne de nouvelles cartes.
export const PHRASES: Phrase[] = [
    // Rutina diaria / vie quotidienne
    { id: 'p001', topic: 'Rutina', es: 'Suelo levantarme antes de que salga el sol.', fr: 'J\'ai l\'habitude de me lever avant que le soleil se lève.' },
    { id: 'p002', topic: 'Rutina', es: 'Aunque esté cansado, siempre hago ejercicio por la mañana.', fr: 'Même si je suis fatigué, je fais toujours du sport le matin.' },
    { id: 'p003', topic: 'Rutina', es: 'Me cuesta acostarme temprano entre semana.', fr: 'J\'ai du mal à me coucher tôt en semaine.' },
    { id: 'p004', topic: 'Rutina', es: 'Antes de salir de casa, reviso que no me falte nada.', fr: 'Avant de sortir de chez moi, je vérifie qu\'il ne me manque rien.' },
    { id: 'p005', topic: 'Rutina', es: 'A veces pierdo el autobús porque me despierto tarde.', fr: 'Parfois je rate le bus parce que je me réveille en retard.' },
    { id: 'p006', topic: 'Rutina', es: 'Prefiero ducharme por la noche en vez de por la mañana.', fr: 'Je préfère me doucher le soir plutôt que le matin.' },
    { id: 'p007', topic: 'Rutina', es: 'En cuanto llego a casa, me quito los zapatos.', fr: 'Dès que j\'arrive à la maison, j\'enlève mes chaussures.' },
    { id: 'p008', topic: 'Rutina', es: 'Llevo dos años sin fumar y me siento mucho mejor.', fr: 'Ça fait deux ans que je ne fume plus et je me sens bien mieux.' },

    // Viajes / voyages
    { id: 'p010', topic: 'Viajes', es: 'Cuando viajo, prefiero alojarme en casas de familias locales.', fr: 'Quand je voyage, je préfère loger chez des familles locales.' },
    { id: 'p011', topic: 'Viajes', es: 'Nos perdimos porque el mapa no estaba actualizado.', fr: 'Nous nous sommes perdus parce que la carte n\'était pas à jour.' },
    { id: 'p012', topic: 'Viajes', es: 'Ojalá pudiera quedarme un mes más en Buenos Aires.', fr: 'J\'aimerais tant pouvoir rester un mois de plus à Buenos Aires.' },
    { id: 'p013', topic: 'Viajes', es: 'El vuelo se retrasó tres horas por la tormenta.', fr: 'Le vol a été retardé de trois heures à cause de l\'orage.' },
    { id: 'p014', topic: 'Viajes', es: 'Antes de reservar, compara siempre varios precios.', fr: 'Avant de réserver, compare toujours plusieurs prix.' },
    { id: 'p015', topic: 'Viajes', es: 'Nunca había probado una comida tan picante como en México.', fr: 'Je n\'avais jamais goûté une nourriture aussi épicée qu\'au Mexique.' },
    { id: 'p016', topic: 'Viajes', es: 'Si hubiera sabido que llovería, habría traído un paraguas.', fr: 'Si j\'avais su qu\'il pleuvrait, j\'aurais apporté un parapluie.' },
    { id: 'p017', topic: 'Viajes', es: 'Lo que más me gustó del viaje fue conocer gente nueva.', fr: 'Ce qui m\'a le plus plu dans ce voyage, c\'était de rencontrer de nouvelles personnes.' },

    // Opiniones / opinions
    { id: 'p020', topic: 'Opiniones', es: 'En mi opinión, deberíamos reducir el uso del plástico.', fr: 'À mon avis, nous devrions réduire l\'utilisation du plastique.' },
    { id: 'p021', topic: 'Opiniones', es: 'No estoy de acuerdo con lo que dijiste sobre el tema.', fr: 'Je ne suis pas d\'accord avec ce que tu as dit à ce sujet.' },
    { id: 'p022', topic: 'Opiniones', es: 'Me parece injusto que le paguen menos por hacer lo mismo.', fr: 'Je trouve injuste qu\'on le paie moins pour faire la même chose.' },
    { id: 'p023', topic: 'Opiniones', es: 'Es posible que tengas razón, pero lo dudo.', fr: 'Il est possible que tu aies raison, mais j\'en doute.' },
    { id: 'p024', topic: 'Opiniones', es: 'Desde mi punto de vista, la educación debería ser gratuita.', fr: 'De mon point de vue, l\'éducation devrait être gratuite.' },
    { id: 'p025', topic: 'Opiniones', es: 'Por más que lo intento, no logro entender su postura.', fr: 'J\'ai beau essayer, je n\'arrive pas à comprendre sa position.' },
    { id: 'p026', topic: 'Opiniones', es: 'Cuanto más lo pienso, menos sentido le encuentro.', fr: 'Plus j\'y pense, moins j\'y trouve de sens.' },

    // Trabajo / travail
    { id: 'p030', topic: 'Trabajo', es: 'Llevo tres años trabajando en la misma empresa.', fr: 'Ça fait trois ans que je travaille dans la même entreprise.' },
    { id: 'p031', topic: 'Trabajo', es: 'Mi jefe quiere que terminemos el proyecto antes del viernes.', fr: 'Mon patron veut que nous terminions le projet avant vendredi.' },
    { id: 'p032', topic: 'Trabajo', es: 'Si consiguiera ese ascenso, me mudaría a otra ciudad.', fr: 'Si j\'obtenais cette promotion, je déménagerais dans une autre ville.' },
    { id: 'p033', topic: 'Trabajo', es: 'Es importante que aprendas a decir que no de vez en cuando.', fr: 'Il est important que tu apprennes à dire non de temps en temps.' },
    { id: 'p034', topic: 'Trabajo', es: 'Estoy harto de que me cambien los horarios sin avisar.', fr: 'J\'en ai marre qu\'on me change les horaires sans prévenir.' },
    { id: 'p035', topic: 'Trabajo', es: 'Renuncié porque no soportaba el ambiente de la oficina.', fr: 'J\'ai démissionné parce que je ne supportais pas l\'ambiance du bureau.' },
    { id: 'p036', topic: 'Trabajo', es: 'En cuanto termine este contrato, buscaré algo más estable.', fr: 'Dès que ce contrat sera terminé, je chercherai quelque chose de plus stable.' },

    // Salud / santé
    { id: 'p040', topic: 'Salud', es: 'Deberías dormir más si quieres sentirte con energía.', fr: 'Tu devrais dormir davantage si tu veux te sentir en forme.' },
    { id: 'p041', topic: 'Salud', es: 'Me duele la espalda desde que empecé a trabajar desde casa.', fr: 'J\'ai mal au dos depuis que j\'ai commencé à travailler de chez moi.' },
    { id: 'p042', topic: 'Salud', es: 'Es recomendable que bebas al menos dos litros de agua al día.', fr: 'Il est recommandé de boire au moins deux litres d\'eau par jour.' },
    { id: 'p043', topic: 'Salud', es: 'Aunque me encanta el dulce, intento comerlo con moderación.', fr: 'Même si j\'adore le sucré, j\'essaie d\'en manger avec modération.' },
    { id: 'p044', topic: 'Salud', es: 'Si te sigues sintiendo mal, deberías ir al médico.', fr: 'Si tu continues à te sentir mal, tu devrais aller chez le médecin.' },
    { id: 'p045', topic: 'Salud', es: 'Dejé de tomar café por la tarde porque no me dejaba dormir.', fr: 'J\'ai arrêté de boire du café l\'après-midi parce que ça m\'empêchait de dormir.' },

    // Emociones / émotions
    { id: 'p050', topic: 'Emociones', es: 'Me pone nervioso hablar en público.', fr: 'Ça me rend nerveux de parler en public.' },
    { id: 'p051', topic: 'Emociones', es: 'Estoy muy orgulloso de lo que has logrado este año.', fr: 'Je suis très fier de ce que tu as accompli cette année.' },
    { id: 'p052', topic: 'Emociones', es: 'Me sentí aliviado en cuanto supe que estabas bien.', fr: 'Je me suis senti soulagé dès que j\'ai su que tu allais bien.' },
    { id: 'p053', topic: 'Emociones', es: 'No soporto que me interrumpan cuando estoy hablando.', fr: 'Je ne supporte pas qu\'on m\'interrompe quand je parle.' },
    { id: 'p054', topic: 'Emociones', es: 'Cuanto más lo espero, más ansioso me pongo.', fr: 'Plus je l\'attends, plus je deviens anxieux.' },
    { id: 'p055', topic: 'Emociones', es: 'Me alegra mucho que hayas venido a visitarme.', fr: 'Je suis très content que tu sois venu me rendre visite.' },
    { id: 'p056', topic: 'Emociones', es: 'A pesar de todo, intento mantener una actitud positiva.', fr: 'Malgré tout, j\'essaie de garder une attitude positive.' },

    // Planes futuros / projets futurs
    { id: 'p060', topic: 'Planes', es: 'Cuando termine mis estudios, me gustaría viajar por Sudamérica.', fr: 'Quand j\'aurai fini mes études, j\'aimerais voyager en Amérique du Sud.' },
    { id: 'p061', topic: 'Planes', es: 'Pienso ahorrar dinero para comprarme un piso en unos años.', fr: 'Je compte économiser de l\'argent pour m\'acheter un appartement dans quelques années.' },
    { id: 'p062', topic: 'Planes', es: 'En cuanto tenga tiempo libre, empezaré a aprender otro idioma.', fr: 'Dès que j\'aurai du temps libre, je commencerai à apprendre une autre langue.' },
    { id: 'p063', topic: 'Planes', es: 'Espero que el próximo año podamos vernos más a menudo.', fr: 'J\'espère que l\'année prochaine nous pourrons nous voir plus souvent.' },
    { id: 'p064', topic: 'Planes', es: 'Si todo va bien, nos mudaremos el mes que viene.', fr: 'Si tout se passe bien, nous déménagerons le mois prochain.' },
    { id: 'p065', topic: 'Planes', es: 'Tengo pensado apuntarme a un curso de cocina.', fr: 'J\'ai l\'intention de m\'inscrire à un cours de cuisine.' },

    // Pasado / passé
    { id: 'p070', topic: 'Pasado', es: 'Cuando era niño, pasaba los veranos en casa de mis abuelos.', fr: 'Quand j\'étais enfant, je passais les étés chez mes grands-parents.' },
    { id: 'p071', topic: 'Pasado', es: 'Ya había cenado cuando me llamaste anoche.', fr: 'J\'avais déjà dîné quand tu m\'as appelé hier soir.' },
    { id: 'p072', topic: 'Pasado', es: 'Nunca me imaginé que acabaríamos siendo tan buenos amigos.', fr: 'Je n\'aurais jamais imaginé que nous finirions par être de si bons amis.' },
    { id: 'p073', topic: 'Pasado', es: 'De pequeño soñaba con ser astronauta.', fr: 'Enfant, je rêvais de devenir astronaute.' },
    { id: 'p074', topic: 'Pasado', es: 'Si hubiera estudiado más, habría aprobado el examen.', fr: 'Si j\'avais plus étudié, j\'aurais réussi l\'examen.' },
    { id: 'p075', topic: 'Pasado', es: 'Recuerdo perfectamente el día en que nos conocimos.', fr: 'Je me souviens parfaitement du jour où nous nous sommes rencontrés.' },

    // Comida / nourriture
    { id: 'p080', topic: 'Comida', es: 'No hay nada que me guste más que una buena paella.', fr: 'Il n\'y a rien que j\'aime plus qu\'une bonne paella.' },
    { id: 'p081', topic: 'Comida', es: 'Deberíamos cocinar en casa más a menudo en lugar de pedir comida.', fr: 'Nous devrions cuisiner à la maison plus souvent au lieu de commander à manger.' },
    { id: 'p082', topic: 'Comida', es: 'Se me hace agua la boca solo con oler el pan recién hecho.', fr: 'J\'en ai l\'eau à la bouche rien qu\'en sentant le pain fraîchement fait.' },
    { id: 'p083', topic: 'Comida', es: 'Es la primera vez que como algo tan exótico.', fr: 'C\'est la première fois que je mange quelque chose d\'aussi exotique.' },
    { id: 'p084', topic: 'Comida', es: 'Prefiero que la comida esté poco condimentada.', fr: 'Je préfère que la nourriture soit peu épicée.' },

    // Relaciones / relations
    { id: 'p090', topic: 'Relaciones', es: 'Es importante que confíes en las personas que quieres.', fr: 'Il est important de faire confiance aux personnes que tu aimes.' },
    { id: 'p091', topic: 'Relaciones', es: 'Llevamos juntos desde que terminamos la universidad.', fr: 'Nous sommes ensemble depuis que nous avons fini l\'université.' },
    { id: 'p092', topic: 'Relaciones', es: 'Nos peleamos por una tontería y todavía no nos hablamos.', fr: 'Nous nous sommes disputés pour une bêtise et nous ne nous parlons toujours pas.' },
    { id: 'p093', topic: 'Relaciones', es: 'Aunque discutamos a veces, nos queremos mucho.', fr: 'Même si on se dispute parfois, on s\'aime beaucoup.' },
    { id: 'p094', topic: 'Relaciones', es: 'Ojalá hubiera pasado más tiempo con mi familia de joven.', fr: 'J\'aurais aimé passer plus de temps avec ma famille quand j\'étais jeune.' },

    // Tecnología / technologie
    { id: 'p100', topic: 'Tecnología', es: 'Cada vez dependemos más de nuestros teléfonos móviles.', fr: 'Nous dépendons de plus en plus de nos téléphones portables.' },
    { id: 'p101', topic: 'Tecnología', es: 'Dudo que las redes sociales nos hagan más felices.', fr: 'Je doute que les réseaux sociaux nous rendent plus heureux.' },
    { id: 'p102', topic: 'Tecnología', es: 'Antes de que existieran los mapas digitales, nos perdíamos constantemente.', fr: 'Avant l\'existence des cartes numériques, nous nous perdions constamment.' },
    { id: 'p103', topic: 'Tecnología', es: 'Es probable que en el futuro trabajemos menos horas gracias a la inteligencia artificial.', fr: 'Il est probable qu\'à l\'avenir nous travaillions moins d\'heures grâce à l\'intelligence artificielle.' },
    { id: 'p104', topic: 'Tecnología', es: 'Se me estropeó el ordenador justo antes de entregar el trabajo.', fr: 'Mon ordinateur est tombé en panne juste avant de rendre le travail.' },

    // Medio ambiente / environnement
    { id: 'p110', topic: 'Medio ambiente', es: 'Si no cuidamos el planeta, las próximas generaciones sufrirán las consecuencias.', fr: 'Si nous ne prenons pas soin de la planète, les prochaines générations en subiront les conséquences.' },
    { id: 'p111', topic: 'Medio ambiente', es: 'Cada vez más gente elige ir en bicicleta para contaminar menos.', fr: 'De plus en plus de gens choisissent le vélo pour polluer moins.' },
    { id: 'p112', topic: 'Medio ambiente', es: 'Es una lástima que se desperdicie tanta comida cada día.', fr: 'C\'est dommage que l\'on gaspille autant de nourriture chaque jour.' },
    { id: 'p113', topic: 'Medio ambiente', es: 'Deberíamos exigir que las empresas usen menos plástico.', fr: 'Nous devrions exiger que les entreprises utilisent moins de plastique.' },

    // Clima / temps
    { id: 'p120', topic: 'Clima', es: 'Aunque hace frío, prefiero salir a caminar todos los días.', fr: 'Même s\'il fait froid, je préfère sortir marcher tous les jours.' },
    { id: 'p121', topic: 'Clima', es: 'No esperaba que lloviera tanto en esta época del año.', fr: 'Je ne m\'attendais pas à ce qu\'il pleuve autant à cette période de l\'année.' },
    { id: 'p122', topic: 'Clima', es: 'En cuanto salga el sol, iremos a la playa.', fr: 'Dès que le soleil sortira, nous irons à la plage.' },

    // Tiempo libre / loisirs
    { id: 'p130', topic: 'Tiempo libre', es: 'Me relaja mucho leer antes de dormir.', fr: 'Ça me détend beaucoup de lire avant de dormir.' },
    { id: 'p131', topic: 'Tiempo libre', es: 'Los fines de semana suelo quedar con mis amigos para tomar algo.', fr: 'Le week-end, j\'ai l\'habitude de retrouver mes amis pour boire un verre.' },
    { id: 'p132', topic: 'Tiempo libre', es: 'Llevo meses queriendo apuntarme a clases de baile.', fr: 'Ça fait des mois que je veux m\'inscrire à des cours de danse.' },
    { id: 'p133', topic: 'Tiempo libre', es: 'Nada me relaja tanto como pasear por la naturaleza.', fr: 'Rien ne me détend autant que de me promener dans la nature.' },

    // Educación / éducation
    { id: 'p140', topic: 'Educación', es: 'Es fundamental que los niños aprendan a pensar de forma crítica.', fr: 'Il est essentiel que les enfants apprennent à penser de manière critique.' },
    { id: 'p141', topic: 'Educación', es: 'Ojalá hubiera tenido mejores profesores de idiomas en el colegio.', fr: 'J\'aurais aimé avoir de meilleurs professeurs de langues à l\'école.' },
    { id: 'p142', topic: 'Educación', es: 'Cuanto antes empieces a estudiar, menos estrés tendrás al final.', fr: 'Plus tôt tu commenceras à étudier, moins tu seras stressé à la fin.' },
    { id: 'p143', topic: 'Educación', es: 'Aprender un idioma requiere práctica constante, no solo teoría.', fr: 'Apprendre une langue demande une pratique constante, pas seulement de la théorie.' },

    // Ciudad y sociedad / ville et société
    { id: 'p150', topic: 'Sociedad', es: 'El precio de los alquileres ha subido muchísimo este año.', fr: 'Le prix des loyers a énormément augmenté cette année.' },
    { id: 'p151', topic: 'Sociedad', es: 'Cuantas más personas se mudan a la ciudad, más caro se vuelve vivir allí.', fr: 'Plus il y a de gens qui déménagent en ville, plus il devient cher d\'y vivre.' },
    { id: 'p152', topic: 'Sociedad', es: 'Me sorprende que todavía existan tantas desigualdades.', fr: 'Ça me surprend qu\'il existe encore autant d\'inégalités.' },
];
