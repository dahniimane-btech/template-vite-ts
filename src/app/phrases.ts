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

    // Vida diaria / vie quotidienne
    { id: 'p200', topic: 'Rutina', es: 'No me di cuenta de que ya era tan tarde.', fr: 'Je ne me suis pas rendu compte qu\'il était déjà si tard.' },
    { id: 'p201', topic: 'Rutina', es: 'Siempre dejo las cosas para el último momento.', fr: 'Je remets toujours les choses au dernier moment.' },
    { id: 'p202', topic: 'Rutina', es: 'Me he acostumbrado a trabajar con música de fondo.', fr: 'Je me suis habitué à travailler avec de la musique en fond.' },
    { id: 'p203', topic: 'Rutina', es: 'Por poco se me olvida llamarte ayer.', fr: 'J\'ai failli oublier de t\'appeler hier.' },
    { id: 'p204', topic: 'Rutina', es: 'Cuanto antes salgamos, menos tráfico encontraremos.', fr: 'Plus tôt nous partirons, moins nous trouverons de circulation.' },
    { id: 'p205', topic: 'Rutina', es: 'Se me hizo tarde porque el metro iba muy lleno.', fr: 'J\'ai été en retard parce que le métro était très plein.' },
    { id: 'p206', topic: 'Rutina', es: 'Todavía no he tenido tiempo de ordenar el apartamento.', fr: 'Je n\'ai pas encore eu le temps de ranger l\'appartement.' },
    { id: 'p207', topic: 'Rutina', es: 'Suelo preparar la comida el domingo para toda la semana.', fr: 'J\'ai l\'habitude de préparer les repas le dimanche pour toute la semaine.' },
    { id: 'p208', topic: 'Rutina', es: 'Me molesta que dejen los platos sin fregar.', fr: 'Ça m\'agace qu\'on laisse la vaisselle sans la laver.' },
    { id: 'p209', topic: 'Rutina', es: 'Antes de acostarme, intento no mirar el móvil.', fr: 'Avant de me coucher, j\'essaie de ne pas regarder mon téléphone.' },

    // Opiniones / opinions
    { id: 'p210', topic: 'Opiniones', es: 'No creo que sea buena idea decidirlo tan rápido.', fr: 'Je ne pense pas que ce soit une bonne idée de le décider si vite.' },
    { id: 'p211', topic: 'Opiniones', es: 'Lo que quiero decir es que necesitamos más tiempo.', fr: 'Ce que je veux dire, c\'est que nous avons besoin de plus de temps.' },
    { id: 'p212', topic: 'Opiniones', es: 'Estoy convencido de que podríamos hacerlo mejor.', fr: 'Je suis convaincu que nous pourrions faire mieux.' },
    { id: 'p213', topic: 'Opiniones', es: 'Me da la impresión de que no me estás escuchando.', fr: 'J\'ai l\'impression que tu ne m\'écoutes pas.' },
    { id: 'p214', topic: 'Opiniones', es: 'Vale la pena intentarlo aunque no funcione.', fr: 'Ça vaut la peine d\'essayer même si ça ne marche pas.' },
    { id: 'p215', topic: 'Opiniones', es: 'Depende de lo que entiendas por éxito.', fr: 'Ça dépend de ce que tu entends par réussite.' },
    { id: 'p216', topic: 'Opiniones', es: 'No tiene sentido discutir sobre algo que ya pasó.', fr: 'Ça n\'a aucun sens de discuter de quelque chose qui est déjà passé.' },
    { id: 'p217', topic: 'Opiniones', es: 'Hasta cierto punto entiendo su reacción.', fr: 'Jusqu\'à un certain point, je comprends sa réaction.' },
    { id: 'p218', topic: 'Opiniones', es: 'Me parece exagerado que se enfaden por tan poco.', fr: 'Je trouve exagéré qu\'ils se fâchent pour si peu.' },
    { id: 'p219', topic: 'Opiniones', es: 'A largo plazo, esta decisión nos beneficiará a todos.', fr: 'À long terme, cette décision nous profitera à tous.' },

    // Trabajo / travail
    { id: 'p220', topic: 'Trabajo', es: 'Me encargo de coordinar al equipo cada mañana.', fr: 'Je me charge de coordonner l\'équipe chaque matin.' },
    { id: 'p221', topic: 'Trabajo', es: 'Nos pidieron que entregáramos el informe cuanto antes.', fr: 'On nous a demandé de rendre le rapport au plus vite.' },
    { id: 'p222', topic: 'Trabajo', es: 'Aunque el sueldo no sea alto, el ambiente compensa.', fr: 'Même si le salaire n\'est pas élevé, l\'ambiance compense.' },
    { id: 'p223', topic: 'Trabajo', es: 'Llevo toda la semana intentando contactar con ellos.', fr: 'Ça fait toute la semaine que j\'essaie de les contacter.' },
    { id: 'p224', topic: 'Trabajo', es: 'Si me hubieran avisado antes, habría cambiado mis planes.', fr: 'S\'ils m\'avaient prévenu plus tôt, j\'aurais changé mes plans.' },
    { id: 'p225', topic: 'Trabajo', es: 'Prefiero que me digan la verdad aunque duela.', fr: 'Je préfère qu\'on me dise la vérité même si ça fait mal.' },
    { id: 'p226', topic: 'Trabajo', es: 'Trabajar desde casa tiene tantas ventajas como inconvenientes.', fr: 'Travailler depuis chez soi a autant d\'avantages que d\'inconvénients.' },
    { id: 'p227', topic: 'Trabajo', es: 'Espero que la reunión no se alargue demasiado.', fr: 'J\'espère que la réunion ne va pas trop s\'éterniser.' },
    { id: 'p228', topic: 'Trabajo', es: 'Me costó mucho adaptarme al nuevo sistema.', fr: 'J\'ai eu beaucoup de mal à m\'adapter au nouveau système.' },
    { id: 'p229', topic: 'Trabajo', es: 'Cuando acabe el proyecto, me tomaré unos días libres.', fr: 'Quand le projet sera fini, je prendrai quelques jours de congé.' },

    // Viajes / voyages
    { id: 'p230', topic: 'Viajes', es: 'Merece la pena madrugar para ver el amanecer.', fr: 'Ça vaut la peine de se lever tôt pour voir le lever du soleil.' },
    { id: 'p231', topic: 'Viajes', es: 'En cuanto lleguemos, buscaremos un sitio para comer.', fr: 'Dès que nous arriverons, nous chercherons un endroit où manger.' },
    { id: 'p232', topic: 'Viajes', es: 'Nos recomendaron que evitáramos esa zona por la noche.', fr: 'On nous a recommandé d\'éviter ce quartier la nuit.' },
    { id: 'p233', topic: 'Viajes', es: 'Cada vez que viajo, aprendo algo nuevo sobre mí mismo.', fr: 'Chaque fois que je voyage, j\'apprends quelque chose de nouveau sur moi-même.' },
    { id: 'p234', topic: 'Viajes', es: 'Se nos pasó el tiempo volando en aquella ciudad.', fr: 'Le temps a filé à toute vitesse dans cette ville.' },
    { id: 'p235', topic: 'Viajes', es: 'No esperaba que la gente fuera tan acogedora.', fr: 'Je ne m\'attendais pas à ce que les gens soient si accueillants.' },
    { id: 'p236', topic: 'Viajes', es: 'Llevábamos horas caminando cuando por fin encontramos el hotel.', fr: 'Nous marchions depuis des heures quand nous avons enfin trouvé l\'hôtel.' },
    { id: 'p237', topic: 'Viajes', es: 'Me gustaría volver algún día con más calma.', fr: 'J\'aimerais y retourner un jour plus tranquillement.' },
    { id: 'p238', topic: 'Viajes', es: 'Por mucho que planifiques, siempre surge algo inesperado.', fr: 'Tu as beau planifier, il survient toujours quelque chose d\'inattendu.' },
    { id: 'p239', topic: 'Viajes', es: 'El billete nos salió más barato de lo que pensábamos.', fr: 'Le billet nous est revenu moins cher que ce que nous pensions.' },

    // Emociones / émotions
    { id: 'p240', topic: 'Emociones', es: 'Me arrepiento de no haberle dicho lo que sentía.', fr: 'Je regrette de ne pas lui avoir dit ce que je ressentais.' },
    { id: 'p241', topic: 'Emociones', es: 'Cada vez que lo recuerdo, se me pone la piel de gallina.', fr: 'Chaque fois que je m\'en souviens, j\'ai la chair de poule.' },
    { id: 'p242', topic: 'Emociones', es: 'No te preocupes, todo va a salir bien.', fr: 'Ne t\'inquiète pas, tout va bien se passer.' },
    { id: 'p243', topic: 'Emociones', es: 'Me sentiría mucho mejor si me lo explicaras con calma.', fr: 'Je me sentirais bien mieux si tu me l\'expliquais calmement.' },
    { id: 'p244', topic: 'Emociones', es: 'Me dio mucha rabia que nadie dijera nada.', fr: 'Ça m\'a beaucoup énervé que personne ne dise rien.' },
    { id: 'p245', topic: 'Emociones', es: 'Tengo la sensación de que algo no va bien.', fr: 'J\'ai le sentiment que quelque chose ne va pas.' },
    { id: 'p246', topic: 'Emociones', es: 'Me hace ilusión que vengas a pasar las fiestas.', fr: 'Ça me réjouit que tu viennes passer les fêtes.' },
    { id: 'p247', topic: 'Emociones', es: 'Por fin me he quitado un peso de encima.', fr: 'Je me suis enfin enlevé un poids des épaules.' },
    { id: 'p248', topic: 'Emociones', es: 'Estaba tan nervioso que no pude dormir en toda la noche.', fr: 'J\'étais si nerveux que je n\'ai pas pu dormir de toute la nuit.' },
    { id: 'p249', topic: 'Emociones', es: 'Me cuesta expresar lo que siento en voz alta.', fr: 'J\'ai du mal à exprimer à voix haute ce que je ressens.' },

    // Relaciones / relations
    { id: 'p250', topic: 'Relaciones', es: 'Nos conocimos por casualidad en una cafetería.', fr: 'Nous nous sommes rencontrés par hasard dans un café.' },
    { id: 'p251', topic: 'Relaciones', es: 'Siempre puedes contar conmigo cuando lo necesites.', fr: 'Tu peux toujours compter sur moi quand tu en auras besoin.' },
    { id: 'p252', topic: 'Relaciones', es: 'Es normal que a veces no estemos de acuerdo.', fr: 'C\'est normal que nous ne soyons pas toujours d\'accord.' },
    { id: 'p253', topic: 'Relaciones', es: 'Hacía años que no hablábamos y fue como si nada.', fr: 'Ça faisait des années qu\'on ne se parlait plus et c\'était comme si de rien n\'était.' },
    { id: 'p254', topic: 'Relaciones', es: 'Me habría gustado que me lo contaras antes.', fr: 'J\'aurais aimé que tu me le racontes avant.' },
    { id: 'p255', topic: 'Relaciones', es: 'Poco a poco fuimos perdiendo el contacto.', fr: 'Peu à peu, nous avons perdu le contact.' },
    { id: 'p256', topic: 'Relaciones', es: 'Lo que más valoro de él es su sinceridad.', fr: 'Ce que j\'apprécie le plus chez lui, c\'est sa sincérité.' },
    { id: 'p257', topic: 'Relaciones', es: 'Nunca es tarde para pedir perdón.', fr: 'Il n\'est jamais trop tard pour demander pardon.' },
    { id: 'p258', topic: 'Relaciones', es: 'Me trata como si fuéramos de la familia.', fr: 'Il me traite comme si nous étions de la famille.' },
    { id: 'p259', topic: 'Relaciones', es: 'Prefiero rodearme de gente que me aporte algo.', fr: 'Je préfère m\'entourer de gens qui m\'apportent quelque chose.' },

    // Estudios / études
    { id: 'p260', topic: 'Educación', es: 'Me habría gustado estudiar algo más creativo.', fr: 'J\'aurais aimé étudier quelque chose de plus créatif.' },
    { id: 'p261', topic: 'Educación', es: 'Por más que estudio, siempre se me olvidan los verbos irregulares.', fr: 'J\'ai beau étudier, j\'oublie toujours les verbes irréguliers.' },
    { id: 'p262', topic: 'Educación', es: 'Lo importante es practicar un poco todos los días.', fr: 'L\'important, c\'est de pratiquer un peu tous les jours.' },
    { id: 'p263', topic: 'Educación', es: 'Nadie nace sabiendo, todos cometemos errores.', fr: 'Personne ne naît en sachant tout, nous faisons tous des erreurs.' },
    { id: 'p264', topic: 'Educación', es: 'Al principio me costaba, pero ahora lo entiendo mejor.', fr: 'Au début, j\'avais du mal, mais maintenant je comprends mieux.' },
    { id: 'p265', topic: 'Educación', es: 'Conviene repasar lo aprendido antes de seguir avanzando.', fr: 'Il convient de réviser ce qu\'on a appris avant de continuer à avancer.' },
    { id: 'p266', topic: 'Educación', es: 'Me apunté a un curso para mejorar mi pronunciación.', fr: 'Je me suis inscrit à un cours pour améliorer ma prononciation.' },
    { id: 'p267', topic: 'Educación', es: 'Cuando entiendes la lógica, todo resulta más sencillo.', fr: 'Quand tu comprends la logique, tout devient plus simple.' },

    // Dinero / argent
    { id: 'p270', topic: 'Dinero', es: 'Llevo meses ahorrando para poder mudarme.', fr: 'Ça fait des mois que j\'économise pour pouvoir déménager.' },
    { id: 'p271', topic: 'Dinero', es: 'No me alcanza el sueldo para llegar a fin de mes.', fr: 'Mon salaire ne me suffit pas pour finir le mois.' },
    { id: 'p272', topic: 'Dinero', es: 'Antes de comprarlo, piénsalo dos veces.', fr: 'Avant de l\'acheter, réfléchis-y à deux fois.' },
    { id: 'p273', topic: 'Dinero', es: 'Me salió mucho más caro de lo previsto.', fr: 'Ça m\'est revenu bien plus cher que prévu.' },
    { id: 'p274', topic: 'Dinero', es: 'Es mejor invertir en calidad que comprar cosas baratas.', fr: 'Il vaut mieux investir dans la qualité que d\'acheter des choses bon marché.' },
    { id: 'p275', topic: 'Dinero', es: 'Si gastaras menos, podrías viajar más.', fr: 'Si tu dépensais moins, tu pourrais voyager davantage.' },
    { id: 'p276', topic: 'Dinero', es: 'Me devolvieron el dinero sin poner ninguna pega.', fr: 'On m\'a remboursé sans faire la moindre difficulté.' },

    // Salud / santé
    { id: 'p280', topic: 'Salud', es: 'Desde que hago deporte, duermo mucho mejor.', fr: 'Depuis que je fais du sport, je dors bien mieux.' },
    { id: 'p281', topic: 'Salud', es: 'El médico me recomendó que redujera la sal.', fr: 'Le médecin m\'a recommandé de réduire le sel.' },
    { id: 'p282', topic: 'Salud', es: 'Llevo toda la semana con dolor de garganta.', fr: 'Ça fait toute la semaine que j\'ai mal à la gorge.' },
    { id: 'p283', topic: 'Salud', es: 'Más vale prevenir que curar.', fr: 'Mieux vaut prévenir que guérir.' },
    { id: 'p284', topic: 'Salud', es: 'No deberías tomar medicamentos sin consultar antes.', fr: 'Tu ne devrais pas prendre de médicaments sans consulter d\'abord.' },
    { id: 'p285', topic: 'Salud', es: 'Me hace falta desconectar unos días.', fr: 'J\'ai besoin de déconnecter quelques jours.' },
    { id: 'p286', topic: 'Salud', es: 'Cuanto más estrés tengo, peor me alimento.', fr: 'Plus j\'ai de stress, plus je me nourris mal.' },

    // Tecnología / technologie
    { id: 'p290', topic: 'Tecnología', es: 'Se me ha bloqueado el ordenador otra vez.', fr: 'Mon ordinateur s\'est encore bloqué.' },
    { id: 'p291', topic: 'Tecnología', es: 'Es probable que pronto todo se haga por internet.', fr: 'Il est probable que bientôt tout se fasse par internet.' },
    { id: 'p292', topic: 'Tecnología', es: 'Deberías hacer una copia de seguridad por si acaso.', fr: 'Tu devrais faire une sauvegarde au cas où.' },
    { id: 'p293', topic: 'Tecnología', es: 'Me paso demasiadas horas delante de la pantalla.', fr: 'Je passe beaucoup trop d\'heures devant l\'écran.' },
    { id: 'p294', topic: 'Tecnología', es: 'No me fío de las aplicaciones que piden tantos permisos.', fr: 'Je ne fais pas confiance aux applications qui demandent autant d\'autorisations.' },
    { id: 'p295', topic: 'Tecnología', es: 'Gracias a las videollamadas, la distancia importa menos.', fr: 'Grâce aux appels vidéo, la distance compte moins.' },

    // Ciudad y sociedad / ville et société
    { id: 'p300', topic: 'Sociedad', es: 'Cada vez hay menos tiendas pequeñas en el barrio.', fr: 'Il y a de moins en moins de petits commerces dans le quartier.' },
    { id: 'p301', topic: 'Sociedad', es: 'Sería conveniente que hubiera más transporte público.', fr: 'Il serait souhaitable qu\'il y ait davantage de transports en commun.' },
    { id: 'p302', topic: 'Sociedad', es: 'Mucha gente se queja pero pocos actúan.', fr: 'Beaucoup de gens se plaignent mais peu agissent.' },
    { id: 'p303', topic: 'Sociedad', es: 'La situación ha mejorado bastante en los últimos años.', fr: 'La situation s\'est nettement améliorée ces dernières années.' },
    { id: 'p304', topic: 'Sociedad', es: 'Es una pena que se pierdan tantas tradiciones.', fr: 'C\'est dommage que tant de traditions se perdent.' },
    { id: 'p305', topic: 'Sociedad', es: 'Nos guste o no, el mundo está cambiando muy deprisa.', fr: 'Que ça nous plaise ou non, le monde change très vite.' },

    // Medio ambiente / environnement
    { id: 'p310', topic: 'Medio ambiente', es: 'Si todos hiciéramos un pequeño esfuerzo, se notaría.', fr: 'Si nous faisions tous un petit effort, ça se remarquerait.' },
    { id: 'p311', topic: 'Medio ambiente', es: 'Reciclar debería ser un hábito, no una obligación.', fr: 'Recycler devrait être une habitude, pas une obligation.' },
    { id: 'p312', topic: 'Medio ambiente', es: 'Los veranos son cada vez más calurosos.', fr: 'Les étés sont de plus en plus chauds.' },
    { id: 'p313', topic: 'Medio ambiente', es: 'Me preocupa el mundo que vamos a dejar a nuestros hijos.', fr: 'Le monde que nous allons laisser à nos enfants m\'inquiète.' },

    // Tiempo libre / loisirs
    { id: 'p320', topic: 'Tiempo libre', es: 'Hacía tiempo que no me reía tanto.', fr: 'Ça faisait longtemps que je n\'avais pas autant ri.' },
    { id: 'p321', topic: 'Tiempo libre', es: 'Me apetece quedarme en casa viendo una serie.', fr: 'J\'ai envie de rester à la maison à regarder une série.' },
    { id: 'p322', topic: 'Tiempo libre', es: 'Siempre que puedo, salgo a correr por el parque.', fr: 'Chaque fois que je peux, je vais courir dans le parc.' },
    { id: 'p323', topic: 'Tiempo libre', es: 'No hay nada como desconectar un fin de semana entero.', fr: 'Il n\'y a rien de tel que de déconnecter un week-end entier.' },
    { id: 'p324', topic: 'Tiempo libre', es: 'Aunque no se me dé bien, disfruto pintando.', fr: 'Même si je ne suis pas doué, j\'aime peindre.' },
    { id: 'p325', topic: 'Tiempo libre', es: 'Quedamos en vernos el sábado por la tarde.', fr: 'Nous avons convenu de nous voir samedi après-midi.' },

    // Comida / nourriture
    { id: 'p330', topic: 'Comida', es: 'Se me da fatal cocinar, pero lo intento.', fr: 'Je suis nul en cuisine, mais j\'essaie.' },
    { id: 'p331', topic: 'Comida', es: 'Este plato sabe mejor de lo que parece.', fr: 'Ce plat a meilleur goût qu\'il n\'y paraît.' },
    { id: 'p332', topic: 'Comida', es: 'Me han dicho que ese restaurante está muy bien.', fr: 'On m\'a dit que ce restaurant est très bien.' },
    { id: 'p333', topic: 'Comida', es: 'Prefiero cenar ligero para dormir mejor.', fr: 'Je préfère dîner léger pour mieux dormir.' },
    { id: 'p334', topic: 'Comida', es: 'Cada región tiene sus propias especialidades.', fr: 'Chaque région a ses propres spécialités.' },

    // Pasado / passé
    { id: 'p340', topic: 'Pasado', es: 'De no haber sido por ti, no lo habría conseguido.', fr: 'Sans toi, je n\'y serais pas arrivé.' },
    { id: 'p341', topic: 'Pasado', es: 'Antes salíamos mucho más que ahora.', fr: 'Avant, nous sortions beaucoup plus que maintenant.' },
    { id: 'p342', topic: 'Pasado', es: 'Aquel verano cambió por completo mi forma de pensar.', fr: 'Cet été-là a complètement changé ma façon de penser.' },
    { id: 'p343', topic: 'Pasado', es: 'Mientras esperaba, me puse a leer el periódico.', fr: 'Pendant que j\'attendais, je me suis mis à lire le journal.' },
    { id: 'p344', topic: 'Pasado', es: 'Nos habíamos conocido años antes sin saberlo.', fr: 'Nous nous étions rencontrés des années auparavant sans le savoir.' },
    { id: 'p345', topic: 'Pasado', es: 'Con el tiempo me di cuenta de que tenían razón.', fr: 'Avec le temps, je me suis rendu compte qu\'ils avaient raison.' },

    // Planes / projets
    { id: 'p350', topic: 'Planes', es: 'Estoy pensando en cambiar de aires el año que viene.', fr: 'Je pense changer d\'air l\'année prochaine.' },
    { id: 'p351', topic: 'Planes', es: 'Ojalá todo salga como lo hemos planeado.', fr: 'Pourvu que tout se passe comme nous l\'avons prévu.' },
    { id: 'p352', topic: 'Planes', es: 'Antes de decidir nada, quiero consultarlo con la almohada.', fr: 'Avant de rien décider, je veux dormir dessus.' },
    { id: 'p353', topic: 'Planes', es: 'Me propongo leer al menos un libro al mes.', fr: 'Je me propose de lire au moins un livre par mois.' },
    { id: 'p354', topic: 'Planes', es: 'En unos años me veo viviendo en el extranjero.', fr: 'Dans quelques années, je me vois vivre à l\'étranger.' },
    { id: 'p355', topic: 'Planes', es: 'Haré todo lo posible para estar allí a tiempo.', fr: 'Je ferai tout mon possible pour être là à temps.' },
];
