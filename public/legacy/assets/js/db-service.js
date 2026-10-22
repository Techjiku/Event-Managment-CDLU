// ==============================================================================
// CHAUDHARY DEVI LAL UNIVERSITY (CDLU), SIRSA
// 13th TRIVENI YUVA MAHOTSAV 2026 - UNIFIED DATABASE SERVICE
// Connects directly to Supabase with automatic local storage fallback & sync
// ==============================================================================

const DBService = (function() {
    // Initial Seed Data for immediate preview and fallback
    const INITIAL_EVENTS = [
        // ----------------- A. MUSIC EVENTS -----------------
        // 1. Classical Vocal Solo (P:1, A:3, Time: 8-10 min, Age: 25 year)
        { id: 'music_classical_vocal', name: 'Classical Vocal Solo (Hindustani / Carnatic)', category: 'Music', participants_min: 1, participants_max: 1, accompanists_max: 3, time_limit: '8-10 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Khayal, Dhrupad, Dhamar or Tarana. Hindustani or Carnatic style.', rules: 'Cinema songs strictly not allowed. Max 3 accompanists. Age limit 25 years as on 01-07-2026.', scoring_criteria: { sur: 30, taal: 30, selection_of_raga: 20, overall_impact: 20 } },
        // 2. Classical Instrumental Solo (percussion) (P:1, A:3, Time: 8-10 min, Age: 25 year)
        { id: 'music_classical_inst_perc', name: 'Classical Instrumental Solo (Percussion)', category: 'Music', participants_min: 1, participants_max: 1, accompanists_max: 3, time_limit: '8-10 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Tabla, Pakhawaj, Mridangam, Dholak.', rules: 'Own instruments required. No electronic rhythm boxes. Max 3 accompanists. Age limit 25 years.', scoring_criteria: { taal_clarity: 35, layakari: 35, composition: 15, overall_impact: 15 } },
        // 3. Classical Instrumental Solo (Non-Percussion) (P:1, A:3, Time: 8-10 min, Age: 25 year)
        { id: 'music_classical_inst_nonperc', name: 'Classical Instrumental Solo (Non-Percussion)', category: 'Music', participants_min: 1, participants_max: 1, accompanists_max: 3, time_limit: '8-10 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Sitar, Sarod, Flute, Violin, Santoor.', rules: 'Hindustani or Carnatic ragas. Pure classical compositions. Casio not allowed. Max 3 accompanists. Age limit 25 years.', scoring_criteria: { sur_swara: 35, taal: 25, raga_purity: 20, overall_impact: 20 } },
        // 4. Light Vocal Indian* (P:1, A:3, Time: 4-6 min, Age: 25 year)
        { id: 'music_light_vocal', name: 'Light Vocal Indian (Solo)*', category: 'Music', participants_min: 1, participants_max: 1, accompanists_max: 3, time_limit: '4-6 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Geet, Ghazal, Bhajan, Shabad, Abhangas.', rules: 'Film songs are not permitted. Max 3 accompanists. 15s grace time. Age limit 25 years.', scoring_criteria: { voice_quality: 30, sur_melody: 30, expression: 20, presentation: 20 } },
        // 5. Western Vocal Solo* (P:1, A:3, Time: 4-6 min, Age: 25 year)
        { id: 'music_western_vocal_solo', name: 'Western Vocal Solo*', category: 'Music', participants_min: 1, participants_max: 1, accompanists_max: 3, time_limit: '4-6 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'English solo vocal song.', rules: 'In English only. Live accompaniment only. Max 3 accompanists. Age limit 25 years.', scoring_criteria: { vocal_control: 30, pitch_rhythm: 30, diction: 20, stage_appeal: 20 } },
        // 6. Indian Group Song (P:6, A:5, Time: 8-10 min, Age: 25 year)
        { id: 'music_indian_group_song', name: 'Indian Group Song', category: 'Music', participants_min: 4, participants_max: 6, accompanists_max: 5, time_limit: '8-10 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Patriotic and regional folk songs (2 songs).', rules: 'Max 6 singers, 5 accompanists. Non-film songs only. Age limit 25 years.', scoring_criteria: { harmony_synchronization: 30, sur_taal: 30, theme_patriotic_value: 20, presentation: 20 } },
        // 7. Western Group Song (P:6, A:5, Time: 8-10 min, Age: 25 year)
        { id: 'music_western_group_song', name: 'Western Group Song', category: 'Music', participants_min: 4, participants_max: 6, accompanists_max: 5, time_limit: '8-10 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Western choir or vocal harmony ensemble in English.', rules: 'English language choir. Max 6 singers and 5 accompanists. Age limit 25 years.', scoring_criteria: { harmony_blend: 35, pitch_tempo: 25, arrangement: 20, overall_performance: 20 } },
        // 8. Folk Orchestra (P:9, A:3, Time: 8-10 min, Age: 25 year)
        { id: 'music_folk_orchestra', name: 'Folk Orchestra (Haryanvi / Indian)', category: 'Music', participants_min: 6, participants_max: 9, accompanists_max: 3, time_limit: '8-10 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Traditional acoustic folk instruments ensemble representing any 1 State.', rules: 'Traditional folk instruments only. Singing strictly prohibited. Max 9 participants, 3 accompanists. Age limit 25 years.', scoring_criteria: { folk_authenticity: 30, coordination: 30, melodic_structure: 20, costume_appeal: 20 } },
        // 9. Western Instrumental Solo (P:1, A:3, Time: 6-8 min, Age: 25 year)
        { id: 'music_western_inst_solo', name: 'Western Instrumental Solo', category: 'Music', participants_min: 1, participants_max: 1, accompanists_max: 3, time_limit: '6-8 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Western music on percussion or non-percussion instrument.', rules: 'Solo performance with up to 3 accompanists. Live accompaniment only. Age limit 25 years.', scoring_criteria: { technique_execution: 35, tempo_rhythm: 30, musicality: 20, overall_impact: 15 } },
        // 10. General Folk Song (Solo) (P:1, A:3, Time: 3-5 min, Age: No limit)
        { id: 'music_general_folk_solo', name: 'General Folk Song (Solo)', category: 'Music', participants_min: 1, participants_max: 1, accompanists_max: 3, time_limit: '3-5 min', age_limit: null, age_limit_text: 'No limit', stage: 'Stage I (Auditorium)', description: 'Traditional Folk Song in any Indian language/dialect (excluding Haryanvi).', rules: 'Authentic traditional folk compositions only. Max 3 accompanists. No age limit.', scoring_criteria: { folk_dialect_authenticity: 35, sur_taal: 30, traditional_flavor: 20, stage_presence: 15 } },
        // 11. Qawwali (P:6-8, A:4, Time: 8-10 min, Age: No limit)
        { id: 'music_qawwali', name: 'Qawwali', category: 'Music', participants_min: 6, participants_max: 8, accompanists_max: 4, time_limit: '8-10 min', age_limit: null, age_limit_text: 'No limit', stage: 'Stage I (Auditorium)', description: 'Traditional Sufi or Devotional Qawwali.', rules: '6-8 participants, 4 accompanists. No recorded content. No age limit.', scoring_criteria: { clapping_chorus_coordination: 30, vocal_power_sur: 30, poetry_depth: 20, overall_atmosphere: 20 } },

        // ----------------- B. DANCE EVENTS -----------------
        // 12. Classical Dance (P:1, A:5, Time: 8-10 min, Age: 25 year)
        { id: 'dance_classical_solo', name: 'Classical Dance (Solo)', category: 'Dance', participants_min: 1, participants_max: 1, accompanists_max: 5, time_limit: '8-10 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Kathak, Kathakali, Bharatnatyam, Manipuri, Kuchipudi, Mohiniyattam, Odissi, Sattriya.', rules: 'Live accompaniment only. Max 5 accompanists. Age limit 25 years as on 01-07-2026.', scoring_criteria: { bhav_expression: 30, mudra_technique: 30, taal_footwork: 25, costume_makeup: 15 } },
        // 13. Haryanvi Group Dance (P:10, A:5, Time: 8-10 min, Age: 25 year)
        { id: 'dance_haryanvi_group', name: 'Haryanvi Group Dance', category: 'Dance', participants_min: 8, participants_max: 10, accompanists_max: 5, time_limit: '8-10 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage II (Open Air Theatre)', description: 'Primitive, folk or tribal dance of Haryana (Phag, Khoria, Dhamal).', rules: 'Traditional Haryanvi attire. Max 10 dancers, 5 accompanists. Age limit 25 years.', scoring_criteria: { rhythm_steps: 30, folk_authenticity: 30, synchronization: 25, costumes_props: 15 } },
        // 14. Creative Choreography (P:12, A:3, Time: 8-10 min, Age: 25 year)
        { id: 'dance_creative_choreography', name: 'Creative Choreography', category: 'Dance', participants_min: 8, participants_max: 12, accompanists_max: 3, time_limit: '8-10 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Thematic contemporary and creative dance with youth/social issue message.', rules: '12 participants, 3 accompanists. Recorded music permitted. Age limit 25 years.', scoring_criteria: { concept_story: 30, formations_synchrony: 30, technique_grace: 25, music_costume_sync: 15 } },
        // 15. General Group Dance (P:10, A:7, Time: 8-10 min, Age: No limit)
        { id: 'dance_general_group', name: 'General Group Dance', category: 'Dance', participants_min: 8, participants_max: 10, accompanists_max: 7, time_limit: '8-10 min', age_limit: null, age_limit_text: 'No limit', stage: 'Stage II (Open Air Theatre)', description: 'Regional Indian Folk Dances (Bhangra, Giddha, Garba, Lavani, etc.).', rules: 'Max 10 dancers, 7 accompanists. No puppet or ballet dance. No age limit.', scoring_criteria: { folk_energy_rhythm: 30, choreography_sync: 30, traditional_essence: 25, costume_grace: 15 } },
        // 16. Folk Ritual Dance (Group) (P:10-16, A:0, Time: 8-10 min, Age: No limit)
        { id: 'dance_folk_ritual_group', name: 'Folk Ritual Dance (Group)', category: 'Dance', participants_min: 10, participants_max: 16, accompanists_max: 0, time_limit: '8-10 min', age_limit: null, age_limit_text: 'No limit', stage: 'Stage II (Open Air Theatre)', description: 'Traditional ritual performance (Chhathi, Sagai, Baan, Chak Poojan, Byah, Vidai, etc.).', rules: '10-16 students male & female. Traditional style only. No recorded film tune. No age limit.', scoring_criteria: { ritual_authenticity: 35, traditional_presentation: 30, coordination: 20, costumes_props: 15 } },
        // 17. Haryanvi Solo Dance (Female) (P:1, A:4, Time: 4-6 min, Age: No limit)
        { id: 'dance_haryanvi_solo_female', name: 'Haryanvi Solo Dance (Female)', category: 'Dance', participants_min: 1, participants_max: 1, accompanists_max: 4, time_limit: '4-6 min', age_limit: null, age_limit_text: 'No limit', stage: 'Stage II (Open Air Theatre)', description: 'Traditional solo female folk dance of Haryana.', rules: 'Haryanvi style and dress only. Max 4 accompanists (1 may be student singer). No age limit.', scoring_criteria: { rhythm_grace: 35, haryanvi_expression: 30, footwork: 20, costume_makeup: 15 } },
        // 18. Haryanvi Solo Dance (Male) (P:1, A:4, Time: 4-6 min, Age: No limit)
        { id: 'dance_haryanvi_solo_male', name: 'Haryanvi Solo Dance (Male)', category: 'Dance', participants_min: 1, participants_max: 1, accompanists_max: 4, time_limit: '4-6 min', age_limit: null, age_limit_text: 'No limit', stage: 'Stage II (Open Air Theatre)', description: 'Traditional solo male folk dance of Haryana.', rules: 'Haryanvi style and dress only. Max 4 accompanists (1 may be student singer). No age limit.', scoring_criteria: { folk_energy: 35, traditional_steps: 30, rhythm_taal: 20, attire_appeal: 15 } },

        // ----------------- C. THEATRE EVENTS -----------------
        // 19. One Act Play (P:9, A:5, Time: 25-30 min, Age: 25 year)
        { id: 'theatre_one_act_play', name: 'One Act Play (Hindi / English / Regional)', category: 'Theatre', participants_min: 4, participants_max: 9, accompanists_max: 5, time_limit: '25-30 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Dramatic one-act stage presentation.', rules: 'Strict time limit 25 to 30 mins. Max 9 actors and 5 accompanists. Age limit 25 years.', scoring_criteria: { acting_expression: 35, direction_stagecraft: 25, dialogue_delivery: 20, theme_script: 20 } },
        // 20. Skit (P:6, A:3, Time: 8-10 min, Age: 25 year)
        { id: 'theatre_skit', name: 'Skit (Hindi / English / Regional)', category: 'Theatre', participants_min: 4, participants_max: 6, accompanists_max: 3, time_limit: '8-10 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Satirical or humorous short play with social message.', rules: 'Vulgarity strictly banned. Max 6 participants, 3 accompanists. Age limit 25 years.', scoring_criteria: { humour_satire_content: 30, acting_timing: 30, dialogue_punch: 20, social_message: 20 } },
        // 21. Mime (P:6, A:2, Time: 4-5 min, Age: 25 year)
        { id: 'theatre_mime', name: 'Mime', category: 'Theatre', participants_min: 4, participants_max: 6, accompanists_max: 2, time_limit: '4-5 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Silent theatrical pantomime.', rules: 'No speech or dialogue permitted. Max 6 participants, 2 accompanists. Age limit 25 years.', scoring_criteria: { body_language_clarity: 35, story_idea: 25, timing_expression: 25, make_up_costume: 15 } },
        // 22. Mimicry* (P:1, A:0, Time: 4-5 min, Age: 25 year)
        { id: 'theatre_mimicry', name: 'Mimicry (Solo)*', category: 'Theatre', participants_min: 1, participants_max: 1, accompanists_max: 0, time_limit: '4-5 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage I (Auditorium)', description: 'Solo imitation of sounds and personalities.', rules: 'No defamatory content allowed. Individual item. 15s grace time. Age limit 25 years.', scoring_criteria: { voice_resemblance: 40, variety_of_sounds: 30, humour_wit: 20, stage_confidence: 10 } },

        // ----------------- D. LITERARY EVENTS -----------------
        // 23. General Quiz (P:3, A:0, Age: 25 year)
        { id: 'lit_quiz', name: 'General Quiz (Team of 3)', category: 'Literary', participants_min: 3, participants_max: 3, accompanists_max: 0, time_limit: 'Prelim + Finals', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage III (Seminar Hall)', description: 'Current Affairs, History, Haryana Heritage, Science, Arts.', rules: 'Team of 3 students per college. Written prelims then finals. Age limit 25 years.', scoring_criteria: { final_score: 100 } },
        // 24. Vagmita (Hindi Elocution)* (P:1, A:0, Time: 4-5 min, Age: 25 year)
        { id: 'lit_vagmita_hindi', name: 'Vagmita (Hindi Elocution)*', category: 'Literary', participants_min: 1, participants_max: 1, accompanists_max: 0, time_limit: '4-5 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage III (Seminar Hall)', description: 'Extempore oration in Hindi on contemporary topics.', rules: 'Paper reading strictly not allowed. 15s grace time. Age limit 25 years.', scoring_criteria: { content_knowledge: 35, language_fluency: 30, articulation_expression: 20, time_adherence: 15 } },
        // 25. Elocution (English)* (P:1, A:0, Time: 4-5 min, Age: 25 year)
        { id: 'lit_elocution_english', name: 'English Elocution*', category: 'Literary', participants_min: 1, participants_max: 1, accompanists_max: 0, time_limit: '4-5 min', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage III (Seminar Hall)', description: 'English oratory on designated social/educational theme.', rules: 'Paper reading not allowed. 15s grace time. Age limit 25 years.', scoring_criteria: { content_depth: 35, diction_vocabulary: 30, confidence_body_language: 20, timing: 15 } },
        // 26. Debate (English)* (P:2, A:0, Time: 4-5 min each, Age: 25 year)
        { id: 'lit_debate_english', name: 'Debate - English (Team of 2)*', category: 'Literary', participants_min: 2, participants_max: 2, accompanists_max: 0, time_limit: '4-5 min each', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage III (Seminar Hall)', description: '1 Speaker FOR, 1 Speaker AGAINST the motion in English.', rules: 'Each speaker gets 4 mins. 15s grace time. Age limit 25 years.', scoring_criteria: { arguments_depth: 35, rebuttal_oratory: 30, fluency_style: 20, decorum_timing: 15 } },
        // 27. Vaad Viwaad (Hindi Debate)* (P:2, A:0, Time: 4-5 min each, Age: 25 year)
        { id: 'lit_debate_hindi', name: 'Vad Viwaad - Hindi Debate (Team of 2)*', category: 'Literary', participants_min: 2, participants_max: 2, accompanists_max: 0, time_limit: '4-5 min each', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage III (Seminar Hall)', description: '1 Paksh (For), 1 Vipaksh (Against) in shuddh Hindi.', rules: 'Paper reading not allowed. 15s grace time. Age limit 25 years.', scoring_criteria: { tark_shakti_arguments: 35, shabdavali_shudhata: 30, prabhawashali_vakta: 20, samay_palan: 15 } },
        // 28. Poetic Symposium (P:1, A:0, Time: Decided by judges, Age: No limit)
        { id: 'lit_poetic_symposium', name: 'Poetic Symposium / Kavi Sammelan', category: 'Literary', participants_min: 1, participants_max: 1, accompanists_max: 0, time_limit: 'Decided by judges', age_limit: null, age_limit_text: 'No limit', stage: 'Stage III (Seminar Hall)', description: 'Recitation of original self-composed poetry.', rules: 'Must be self-composed poem by student participant. No age limit.', scoring_criteria: { poetic_merit_ras: 35, recitation_tarannum: 30, thought_uniqueness: 20, audience_rapport: 15 } },

        // ----------------- E. FINE ARTS EVENTS -----------------
        // 29. On the spot Painting (P:1, A:0, Time: 120-150 min, Age: 25 year)
        { id: 'finearts_painting', name: 'On the Spot Painting', category: 'Fine Arts', participants_min: 1, participants_max: 1, accompanists_max: 0, time_limit: '120-150 min (2.5 Hours)', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage IV (Fine Arts Studio)', description: 'Water color, acrylic or poster color painting on live theme.', rules: 'Drawing sheet provided. Bring own brushes and colors. Age limit 25 years.', scoring_criteria: { creativity_interpretation: 35, composition_color_harmony: 35, technical_skill: 20, neatness: 10 } },
        // 30. Collage (P:1, A:0, Time: 120-150 min, Age: 25 year)
        { id: 'finearts_collage', name: 'Collage Making', category: 'Fine Arts', participants_min: 1, participants_max: 1, accompanists_max: 0, time_limit: '120-150 min (2.5 Hours)', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage IV (Fine Arts Studio)', description: 'Collage with magazines, newspapers and glue.', rules: 'Theme given on the spot. No scissors or sharp tools (hand tearing only). Age limit 25 years.', scoring_criteria: { theme_expression: 35, artistic_arrangement: 30, material_utilization: 25, neatness: 10 } },
        // 31. Poster Making (P:1, A:0, Time: 120-150 min, Age: 25 year)
        { id: 'finearts_poster', name: 'Poster Making', category: 'Fine Arts', participants_min: 1, participants_max: 1, accompanists_max: 0, time_limit: '120-150 min (2.5 Hours)', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage IV (Fine Arts Studio)', description: 'Poster design on national/social awareness theme.', rules: 'Slogans allowed in Hindi or English. Age limit 25 years.', scoring_criteria: { concept_visual_punch: 35, typography_lettering: 30, color_contrast: 25, finishing: 10 } },
        // 32. Clay Modeling (P:1, A:0, Time: 120-150 min, Age: 25 year)
        { id: 'finearts_clay', name: 'Clay Modeling', category: 'Fine Arts', participants_min: 1, participants_max: 1, accompanists_max: 0, time_limit: '120-150 min (2.5 Hours)', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage IV (Fine Arts Studio)', description: 'Sculpting in natural clay on specified subject.', rules: 'Natural clay provided by university. Bring 2ft x 2ft plank. No molds. Age limit 25 years.', scoring_criteria: { sculptural_anatomy: 35, creative_treatment: 30, finish_texture: 25, stability: 10 } },
        // 33. Cartooning (P:1, A:0, Time: 120-150 min, Age: 25 year)
        { id: 'finearts_cartooning', name: 'Cartooning', category: 'Fine Arts', participants_min: 1, participants_max: 1, accompanists_max: 0, time_limit: '120-150 min (2.5 Hours)', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage IV (Fine Arts Studio)', description: 'Editorial and comic caricature drawing.', rules: 'Original witty caricature with punchline caption. Age limit 25 years.', scoring_criteria: { wit_caricature: 35, satirical_point: 30, line_quality: 25, neatness: 10 } },
        // 34. Rangoli (P:1, A:0, Time: 120-150 min, Age: 25 year)
        { id: 'finearts_rangoli', name: 'Rangoli', category: 'Fine Arts', participants_min: 1, participants_max: 1, accompanists_max: 0, time_limit: '120-150 min (2.5 Hours)', age_limit: 25, age_limit_text: '25 Years (as on July 1, 2026)', stage: 'Stage IV (Fine Arts Studio)', description: 'Traditional floor design (4ft x 4ft space).', rules: 'Natural colors and petals only. Freehand only (no stencils/dies). Age limit 25 years.', scoring_criteria: { traditional_design: 35, color_blending: 30, symmetry_precision: 25, overall_beauty: 10 } },

        // ----------------- CULTURAL PROCESSION (ADDITIONAL / AGE LIMIT IGNORED) -----------------
        { id: 'cultural_procession', name: 'Cultural Procession (सांस्कृतिक शोभा यात्रा)', category: 'Procession', participants_min: 10, participants_max: 50, accompanists_max: 0, time_limit: '3-5 min', age_limit: null, age_limit_text: 'No limit (Ignored)', stage: 'Inaugural Procession Route', description: 'Cultural procession / march past presenting state, regional or national heritage.', rules: 'Compulsory two college flags. Marks not counted towards Overall Championship Trophy. Age limit ignored.', scoring_criteria: { cultural_authenticity: 40, discipline_march: 30, presentation_costumes: 30 } }
    ];

    const OFFICIAL_COLLEGE_IDS = Array.from({ length: 21 }, (_, index) => 2601 + index);
    const COLLEGE_ID_BY_NAME = {
        'University Teaching Departments (UTD), CDLU Sirsa': 2601,
        'Govt. National College, Sirsa': 2602,
        'CMK National PG Girls College, Sirsa': 2603,
        'Shah Satnam Ji College, Sirsa': 2604,
        'Janta Girls College, Ellenabad': 2605,
        'Govt. College, Bhattu Kalan': 2606,
        'Govt. College, Rania': 2607,
        'Govt. College, Mandi Dabwali': 2608,
        'JCD Memorial College, Sirsa': 2609,
        'Govt. College for Women, Sirsa': 2610,
        'M.M. PG College, Fatehabad': 2611,
        'Govt. College, Bhuna': 2612
    };
    const OFFICIAL_EVENT_REGISTRY = [
        ['Classical Vocal Solo', 'Music'], ['Classical Instrumental Solo (Percussion)', 'Music'],
        ['Classical Instrumental Solo (Non-Percussion)', 'Music'], ['Light Vocal Indian', 'Music'],
        ['Western Vocal Solo', 'Music'], ['Indian Group Song', 'Music'], ['Western Group Song', 'Music'],
        ['Folk Orchestra', 'Music'], ['Western Instrumental Solo', 'Music'], ['General Folk Song (Solo)', 'Music'],
        ['Qawwali', 'Music'], ['Classical Dance', 'Dance'], ['Haryanvi Group Dance', 'Dance'],
        ['Creative Choreography', 'Dance'], ['General Group Dance', 'Dance'], ['Folk Ritual Dance (Group)', 'Dance'],
        ['Haryanvi Solo Dance (Female)', 'Dance'], ['Haryanvi Solo Dance (Male)', 'Dance'],
        ['One Act Play', 'Theatre'], ['Skit', 'Theatre'], ['Mime', 'Theatre'], ['Mimicry', 'Theatre'],
        ['General Quiz', 'Literary'], ['Vagmita (Hindi Elocution)', 'Literary'], ['Elocution (English)', 'Literary'],
        ['Debate (English)', 'Literary'], ['Vaad Vivaad (Hindi Debate)', 'Literary'], ['Poetic Symposium', 'Literary'],
        ['On the Spot Painting', 'Fine Arts'], ['Collage', 'Fine Arts'], ['Poster Making', 'Fine Arts'],
        ['Clay Modeling', 'Fine Arts'], ['Cartooning', 'Fine Arts'], ['Rangoli', 'Fine Arts']
    ].map(([name, category], index) => ({
        id: `E${String(index + 1).padStart(2, '0')}`,
        name,
        category,
        trophy_event: true
    }));

    function officialEventFor(event) {
        if (!event) return null;
        return OFFICIAL_EVENT_REGISTRY.find(official =>
            event.id === official.id ||
            (event.category === official.category &&
                String(event.name || '').toLocaleLowerCase().includes(official.name.toLocaleLowerCase()))
        ) || null;
    }

    function normalizeEventReference(record) {
        const official = officialEventFor(record);
        return {
            ...record,
            ...(official ? {
                legacy_event_id: record.event_id,
                event_id: official.id,
                event_name: official.name
            } : {}),
            college_id: record.college_id || COLLEGE_ID_BY_NAME[record.college_name] || null
        };
    }

    const JUDGE_CATEGORY_GROUPS = {
        Music: new Set([
            'Mr. Vikas Rohilla', 'Mr. Amit Sharma', 'Mr. Gulab Singh', 'Sh. Dainy',
            'Sh. Harvinder Rana', 'Sh. Tejender Gill', 'Sh. Kailash Verma',
            'Dr. Madhu Sharma', 'Dr. Harwinder Singh', 'Dr. Ravi Guatam',
            'Dr. Rajbir Bhardwaj', 'Dr. Dinesh Raheja', 'Dr. Sunil', 'Dr. Himani Gupta',
            'Dr. Raj Mawar', 'Mr. Raj Methew'
        ]),
        Dance: new Set([
            'Sh. Sushil Kumar', 'Dr. Jagbir Rathi', 'Dr. Partap Rathi',
            'Mr. Kuldeep Rathi', 'Sh. Ram Singh', 'Ms. Bhawana', 'Charanjeet Singh',
            'Dr. Rakhi', 'Sh. Tarsem Chand Khaleri', 'Sh. Sanjay Kayat',
            'Dr. Vaani', 'Sh. Anil Kaushik', 'Sh. V.D. Trikha', 'Sh. Azad',
            'Sh. Azad Duhan', 'Mr. Ram Mehar', 'Ms. Salini Sharma',
            'Sh. Harmandeep Ratan', 'Dr. Sanvi Jethwani', 'Dr. Manjor Singh',
            'Dr. Harvinder Gill', 'Dr. Harsh Gogal Roy'
        ]),
        Theatre: new Set([
            'Mr. Vikas Rohilla', 'Dr. Sakeel Khan', 'Dr. Mandeep Sharma (K.D.)',
            'Dr. Dharmendra Dangi'
        ]),
        Literary: new Set([
            'Dr. Renu Dahiya', 'Mr. Kapil Sehgal', 'Mr. Rajiv Ranjan',
            'Dr. Aarti', 'Ms. Shweta', 'Ms. Yaxita', 'Dr. Shamshir Singh'
        ]),
        'Fine Arts': new Set([
            'Dr. O.P. Kadyan', 'Dr. Amita Goyal', 'Dr. Aarti', 'Dr. Preet Kohli',
            'Ms. Priyanka Sinha'
        ])
    };

    const OFFICIAL_JUDGE_DIRECTORY = [
        'Sh. Janardhan Sharma', 'Mr. Vikas Rohilla', 'Mr. Amit Sharma',
        'Dr. Anil Kaushik', 'Dr. Renu Dahiya', 'Mr. Gulab Singh',
        'Sh. Dainy', 'Sh. Harvinder Rana', 'Sh. Tejender Gill',
        'Dr. Parul', 'Sh. Kailash Verma', 'Dr. Madhu Sharma',
        'Dr. Harwinder Singh', 'Dr. Ravi Guatam', 'Dr. Rajbir Bhardwaj',
        'Dr. Dinesh Raheja', 'Dr. Sunil', 'Dr. Himani Gupta',
        'Dr. Hanif', 'Dr. Pawan Bakshi', 'Dr. Renuka Gambhir',
        'Hari Singh',
        'Sh. Raj Mawar', 'Dr. Anil Bharti', 'Dr. Ravinder Nagar',
        'Sh. Mahavir Guddu', 'Dr. Sukhdass', 'Dr. Vijay Kumar Yamla',
        'Dr. Rama Kanta', 'Sh. Satish Haryanvi', 'Dr. Meenakshi',
        'Dr. Mukesh Rana', 'Dr. Rishpal', 'Dr. Chandni',
        'Dr. Raj Kumar Rathore', 'Dr. Bhupender Malhotra', 'Dr. Devender Verma',
        'Dr. Kiran Kapoor', 'Dr. Santosh Pathak', 'Dr. Ravi', 'Dr. Vinod Khurana',
        'Sh. Satish Balamia', 'Sh. Anil Soni', 'Sh. Sanjeev Sharma',
        'Dr. Quity', 'Dr. Mahender', 'Sh. Charanjeet', 'Mrs. Leeta Saini',
        'Sh. Sushil Kumar', 'Dr. Jagbir Rathi', 'Dr. Partap Rathi',
        'Mr. Kuldeep Rathi', 'Sh. Ram Singh', 'Ms. Bhawana', 'Charanjeet Singh', 'Dr. Rakhi',
        'Sh. Tarsem Chand Khaleri', 'Sh. Sanjay Kayat', 'Dr. Vaani', 'Sh. Anil Kaushik', 'Sh. V.D. Trikha',
        'Shri Shyam Gupta', 'Sh. Azad', 'Rajinder Sharma', 'Sh. Azad Duhan', 'Dr. Sushil',
        'Sh. Parveen Vasisht', 'Sh. Ajit Kumar', 'Dr. Sonal',
        'Sh. Sumer Singh', 'Sh. Bahadur Singh', 'Dr. Ram Niwas Arya',
        'Sh. Vijay Bhatia', 'Sh. Rishiraj Sharma', 'Prof. Maha Singh Punia',
        'Sh. Vishal Vats', 'Prof. Jyoti Sheoran', 'Dr. Geetu Dhawan', 'Dinesh Chahal',
        'Prof. Vikram Kaushik', 'Dr. Shyam Vashisht', 'Dr. Vijay Kumar',
        'Dr. Suman Lata', 'Dr. Asha Poonia', 'Dr. Ramesh Chahal',
        'Sh. Sanjeet Siroha', 'Sh. Yashu Dass', 'Sh. Manoj Chhabra', 'Sh. Rajender Kumar',
        'Sh. Harish Chhikara', 'Dr. O.P. Kadyan', 'Dr. S.Z.H. Nakvi',
        'Mr. Navin Kumar', 'Sh. Anil Kumar Gulia', 'Sh. Girish Shankar',
        'Sh. Jagjit Singh', 'Sh. Girja Shankar', 'Dr. Deepika', 'Ms. Nidhi',
        'Dr. Rajesh Khapra', 'Mr. Vijay Dhore', 'Ms. Gurpreet Kaur Saini',
        'Ms. Priyanka Sinha', 'Mr. Raj Methew', 'Mr. Kapil Sehgal',
        'Mr. Raj Kumar', 'Mr. Ram Mehar', 'Ms. Salini Sharma',
        'Ms. Meenakshi', 'Mr. Rajiv Ranjan', 'Dr. Amita Goyal',
        'Dr. Aarti', 'Sh. Harmandeep Ratan', 'Dr. Sanvi Jethwani',
        'Dr. Sakeel Khan', 'Dr. Manjor Singh', 'Dr. Mandeep Sharma (K.D.)',
        'Dr. Harvinder Gill', 'Dr. Anil', 'Dr. Harsh Gogal Roy',
        'Ms. Shweta', 'Ms. Yaxita', 'Dr. Shamshir Singh',
        'Dr. Preet Kohli', 'Dr. Dharmendra Dangi', 'Mr. Narender',
        'Mr. Lakhvinder', 'Mr. Surender Kamboj', 'Mr. Ajay Singh',
        'Prof. Hukam Chand', 'Dr. Arvinder Singh', 'Dr. Preetpal Singh',
        'Ajay Kumar'
    ].map((name, index) => {
        const assignedCategories = Object.entries(JUDGE_CATEGORY_GROUPS)
            .filter(([, names]) => names.has(name))
            .map(([category]) => category);
        return {
            id: `official-judge-${String(index + 1).padStart(3, '0')}`,
            name,
            email: `judge.roster.${String(index + 1).padStart(3, '0')}@cdlu.local`,
            organization: '13th Triveni Yuva Mahotsav 2026 - Official Judge List',
            assigned_categories: assignedCategories.length ? assignedCategories : ['Music', 'Dance', 'Theatre', 'Literary', 'Fine Arts'],
            assigned_events: [],
            pin: '1234',
            is_active: true
        };
    });

    const INITIAL_JUDGES = OFFICIAL_JUDGE_DIRECTORY;
    const DEMO_JUDGE_EMAILS = new Set([
        'judge.music@cdlu.ac.in',
        'judge.dance@cdlu.ac.in',
        'judge.theatre@cdlu.ac.in',
        'judge.literary@cdlu.ac.in',
        'judge.finearts@cdlu.ac.in'
    ]);

    const INITIAL_REGISTRATIONS = [
        {
            id: 'CDLU-TYM-2026-001',
            event_id: 'music_classical_vocal',
            event_name: 'Classical Vocal Solo (Hindustani / Carnatic)',
            category: 'Music',
            college_name: 'University Teaching Departments (UTD), CDLU Sirsa',
            participant_name: 'Aman Sharma',
            father_name: 'Sh. Rajesh Sharma',
            gender: 'Male',
            class_name: 'MA Music (1st Sem)',
            roll_no: '230101001',
            dob: '2002-05-15',
            phone: '9812345678',
            email: 'aman.sharma@cdlu.ac.in',
            team_manager_name: 'Dr. K. S. Bishnoi',
            team_manager_phone: '9416000001',
            team_manager_email: 'cultural.utd@cdlu.ac.in',
            team_members: [],
            accompanists: [
                { name: 'Master Ramesh', father_name: 'Sh. Omprakash', type: 'Professional', instrument: 'Harmonium' },
                { name: 'Suresh Kumar', father_name: 'Sh. Ram Niwas', type: 'Student', instrument: 'Tabla' }
            ],
            status: 'Eligible',
            chest_number: 101,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
            id: 'CDLU-TYM-2026-002',
            event_id: 'dance_haryanvi_group',
            event_name: 'Haryanvi Group Dance',
            category: 'Dance',
            college_name: 'Govt. National College, Sirsa',
            participant_name: 'Sunita Devi',
            father_name: 'Sh. Kuldeep Singh',
            gender: 'Female',
            class_name: 'BA Final Year',
            roll_no: '221004501',
            dob: '2003-08-12',
            phone: '9896000002',
            email: 'sunita.gnc@gmail.com',
            team_manager_name: 'Prof. Neelam Rani',
            team_manager_phone: '9416000002',
            team_manager_email: 'contingent.gnc@gmail.com',
            team_members: [
                { name: 'Pooja Rani', father_name: 'Sh. Rattan Lal', class: 'BA II', roll_no: '221004502' },
                { name: 'Kavita Sihag', father_name: 'Sh. Balwan Singh', class: 'B.Sc II', roll_no: '221004503' },
                { name: 'Monika', father_name: 'Sh. Dharamvir', class: 'BA I', roll_no: '221004504' },
                { name: 'Anjali Verma', father_name: 'Sh. Mahabir Verma', class: 'B.Com III', roll_no: '221004505' }
            ],
            accompanists: [
                { name: 'Pandit Jagdish', father_name: 'Sh. Mani Ram', type: 'Professional', instrument: 'Dholak / Nagada' }
            ],
            status: 'Eligible',
            chest_number: 102,
            created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 'CDLU-TYM-2026-003',
            event_id: 'theatre_one_act_play',
            event_name: 'One Act Play (Hindi / English / Haryanvi)',
            category: 'Theatre',
            college_name: 'Janta Girls College, Ellenabad',
            participant_name: 'Ritika Mittal',
            father_name: 'Sh. Pawan Mittal',
            gender: 'Female',
            class_name: 'MA English',
            roll_no: '230205010',
            dob: '2001-11-20',
            phone: '9416111222',
            email: 'ritika.jgc@gmail.com',
            team_manager_name: 'Dr. Meenakshi',
            team_manager_phone: '9416000003',
            team_manager_email: 'theatre.jgc@gmail.com',
            team_members: [
                { name: 'Simran Kaur', father_name: 'Sh. Harbhajan Singh', class: 'BA III', roll_no: '220205011' },
                { name: 'Diksha', father_name: 'Sh. Subhash Chander', class: 'BA II', roll_no: '220205012' },
                { name: 'Muskan', father_name: 'Sh. Rakesh', class: 'B.Com I', roll_no: '230205013' }
            ],
            accompanists: [],
            status: 'Eligible',
            chest_number: 103,
            created_at: new Date(Date.now() - 43200000).toISOString()
        }
    ];

    const INITIAL_SCORES = [
        {
            id: 'score-001',
            registration_id: 'CDLU-TYM-2026-001',
            participant_name: 'Aman Sharma',
            college_name: 'University Teaching Departments (UTD), CDLU Sirsa',
            event_id: 'music_classical_vocal',
            event_name: 'Classical Vocal Solo (Hindustani / Carnatic)',
            judge_id: 'j-001',
            judge_name: 'Sh. Janardhan Sharma',
            judge_email: 'judge.roster.001@cdlu.local',
            criteria_breakdown: { sur: 27, taal: 26, selection_of_raga: 18, overall_impact: 18 },
            total_score: 89.0,
            remarks: 'Remarkable command over Raga Bhairav and vilambit khayal.',
            is_locked: true,
            created_at: new Date(Date.now() - 3600000).toISOString()
        }
    ];

    let isCloudConnected = false;
    let isSchemaPending = false;

    // Local Storage Helpers
    function getLocal(key, defaultVal) {
        try {
            const data = localStorage.getItem('cdlu_' + key);
            return data ? JSON.parse(data) : defaultVal;
        } catch (e) {
            return defaultVal;
        }
    }

    function setLocal(key, value) {
        try {
            localStorage.setItem('cdlu_' + key, JSON.stringify(value));
        } catch (e) {
            console.error('LocalStorage write error:', e);
        }

        function createRegistrationId() {
            const randomPart = window.crypto && typeof window.crypto.randomUUID === 'function'
                ? window.crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()
                : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`.toUpperCase();
            return `CDLU-TYM-2026-${randomPart}`;
        }
    }

    // ==========================================================================
    // AUTHORITATIVE CDLU 13TH TRIVENI YUVA MAHOTSAV 2026 AGE LIMIT DICTIONARY
    // Derived directly from DIRECTORATE OF YOUTH WELFARE EVENT GUIDELINES AT A GLANCE
    // ==========================================================================
    const OFFICIAL_EVENT_AGE_LIMITS = {
        // MUSIC (Items 1 - 11)
        'music_classical_vocal': 25,
        'music_classical_inst_perc': 25,
        'music_classical_inst_nonperc': 25,
        'music_light_vocal': 25,
        'music_western_vocal_solo': 25,
        'music_indian_group_song': 25,
        'music_western_group_song': 25,
        'music_folk_orchestra': 25,
        'music_western_inst_solo': 25,
        'music_general_folk_solo': null, // Item 10: General Folk Song (Solo) - No limit
        'music_qawwali': null,           // Item 11: Qawwali - No limit

        // DANCE (Items 12 - 18)
        'dance_classical_solo': 25,
        'dance_haryanvi_group': 25,
        'dance_creative_choreography': 25,
        'dance_general_group': null,        // Item 15: General Group Dance - No limit
        'dance_folk_ritual_group': null,    // Item 16: Folk Ritual Dance (Group) - No limit
        'dance_haryanvi_solo_female': null, // Item 17: Haryanvi Solo Dance (Female) - No limit
        'dance_haryanvi_solo_male': null,   // Item 18: Haryanvi Solo Dance (Male) - No limit

        // THEATRE (Items 19 - 22)
        'theatre_one_act_play': 25,
        'theatre_skit': 25,
        'theatre_mime': 25,
        'theatre_mimicry': 25,

        // LITERARY (Items 23 - 28)
        'lit_quiz': 25,
        'lit_vagmita_hindi': 25,
        'lit_elocution_english': 25,
        'lit_debate_english': 25,
        'lit_debate_hindi': 25,
        'lit_poetic_symposium': null, // Item 28: Poetic Symposium - No limit

        // FINE ARTS (Items 29 - 34)
        'finearts_painting': 25,
        'finearts_collage': 25,
        'finearts_poster': 25,
        'finearts_clay': 25,
        'finearts_cartooning': 25,
        'finearts_rangoli': 25,

        // CULTURAL PROCESSION (Ignored / No Age Limit per University Guidelines)
        'cultural_procession': null
    };

    function getOfficialEventAgeLimit(eventId, eventName) {
        const id = (eventId || '').trim().toLowerCase();
        const name = (eventName || '').trim().toLowerCase();

        // 1. Cultural Procession is always ignored / exempt
        if (id.includes('procession') || name.includes('procession') || name.includes('शोभा')) {
            return null;
        }

        // 2. Exact match in official dictionary
        if (OFFICIAL_EVENT_AGE_LIMITS.hasOwnProperty(id)) {
            return OFFICIAL_EVENT_AGE_LIMITS[id];
        }

        // 3. Fallback name keyword matching for official exempt items
        if (
            name.includes('general folk') ||
            name.includes('qawwali') ||
            name.includes('general group') ||
            name.includes('folk ritual') ||
            name.includes('haryanvi solo') ||
            name.includes('poetic symposium') ||
            name.includes('kavi sammelan')
        ) {
            return null; // Explicitly No Limit
        }

        // 4. Default for all other official youth festival competitive events is 25 years
        return 25;
    }

    function enrichEventData(evt) {
        if (!evt) return null;
        const e = Object.assign({}, evt);
        const limit = getOfficialEventAgeLimit(e.id, e.name);
        e.age_limit = limit;
        e.age_limit_text = limit ? `${limit} Years (as on July 1, 2026)` : 'No limit';
        return e;
    }

    // Initialize local cache if empty or outdated
    function ensureLocalSeeds() {
        const storedEvents = localStorage.getItem('cdlu_events');
        if (!storedEvents) {
            setLocal('events', INITIAL_EVENTS);
        } else {
            try {
                const parsed = JSON.parse(storedEvents);
                // Check if existing cache lacks age_limit or has fewer events
                if (!Array.isArray(parsed) || parsed.length < INITIAL_EVENTS.length || !parsed.some(e => e.id === 'dance_folk_ritual_group')) {
                    setLocal('events', INITIAL_EVENTS);
                }
            } catch (e) {
                setLocal('events', INITIAL_EVENTS);
            }
        }
        const storedJudges = getLocal('judges', []);
        const migratedJudges = storedJudges
            .filter(judge => !DEMO_JUDGE_EMAILS.has(String(judge.email || '').toLowerCase()));
        setLocal('judges', migratedJudges.length ? migratedJudges : INITIAL_JUDGES);
        if (!localStorage.getItem('cdlu_registrations')) setLocal('registrations', INITIAL_REGISTRATIONS);
        if (!localStorage.getItem('cdlu_scores')) setLocal('scores', INITIAL_SCORES);
    }

    ensureLocalSeeds();

    function getLocalJudges() {
        return getLocal('judges', INITIAL_JUDGES)
            .filter(judge => !DEMO_JUDGE_EMAILS.has(String(judge.email || '').toLowerCase()));
    }

    // Check Supabase connectivity
    async function checkCloudStatus() {
        const sb = window.getSupabase();
        if (!sb) {
            isCloudConnected = false;
            return { connected: false, message: 'Supabase library not ready' };
        }

        try {
            const { data, error } = await sb.from('events').select('id').limit(1);
            if (error) {
                // If 404 or relation does not exist
                if (error.code === 'PGRST205' || error.message.includes('not find the table') || error.message.includes('relation "public.events" does not exist')) {
                    isCloudConnected = false;
                    isSchemaPending = true;
                    return {
                        connected: false,
                        schemaPending: true,
                        message: 'Supabase URL valid, but tables need to be created using schema.sql'
                    };
                }
                isCloudConnected = false;
                return { connected: false, message: error.message };
            }

            isCloudConnected = true;
            isSchemaPending = false;
            console.log('✓ Connected to Supabase Cloud Database successfully!');
            return { connected: true, message: 'Connected to Supabase Live Cloud' };
        } catch (err) {
            isCloudConnected = false;
            return { connected: false, message: err.message };
        }
    }

    return {
        getOfficialMasterData: function() {
            return {
                collegeIds: [...OFFICIAL_COLLEGE_IDS],
                events: OFFICIAL_EVENT_REGISTRY.map(event => ({ ...event })),
                judgesPerEvent: 3,
                trophyPoints: { 1: 10, 2: 8, 3: 5 }
            };
        },

        init: async function() {
            ensureLocalSeeds();
            const status = await checkCloudStatus();
            return status;
        },

        getCloudStatus: function() {
            return {
                isCloudConnected,
                isSchemaPending,
                url: window.SUPABASE_CONFIG.URL,
                key: window.SUPABASE_CONFIG.ANON_KEY
            };
        },

        // ================= EVENTS =================
        getEvents: async function(category = 'All') {
            let events = [];
            const sb = window.getSupabase();
            if (isCloudConnected && sb) {
                try {
                    let query = sb.from('events').select('*');
                    if (category && category !== 'All') {
                        query = query.eq('category', category);
                    }
                    const { data, error } = await query;
                    if (!error && data && data.length > 0) {
                        events = data;
                    }
                } catch (e) {
                    console.warn('Falling back to local events:', e);
                }
            }

            if (!events || events.length === 0) {
                events = getLocal('events', INITIAL_EVENTS);
                if (category && category !== 'All') {
                    events = events.filter(e => e.category.toLowerCase() === category.toLowerCase());
                }
            }

            INITIAL_EVENTS.forEach(initEvt => {
                if (!events.some(e => e.id === initEvt.id || officialEventFor(e)?.name === officialEventFor(initEvt)?.name)) {
                    if (!category || category === 'All' || initEvt.category.toLowerCase() === category.toLowerCase()) {
                        events.push(initEvt);
                    }
                }
            });

            const canonicalEvents = events.map(event => {
                const official = officialEventFor(event);
                return enrichEventData({
                    ...event,
                    id: official ? official.id : event.id,
                    official_number: official ? Number(official.id.slice(1)) : null,
                    trophy_event: official ? official.trophy_event : false,
                    legacy_id: event.id
                });
            });
            return canonicalEvents.filter((event, index, all) =>
                all.findIndex(candidate => candidate.id === event.id) === index
            );
        },

        getEventById: async function(id) {
            const events = await this.getEvents('All');
            const found = events.find(e => e.id === id);
            return found ? enrichEventData(found) : null;
        },

        // ================= REGISTRATIONS (STUDENTS & TEAMS) =================
        getRegistrations: async function(filterCategory = 'All') {
            const sb = window.getSupabase();
            if (isCloudConnected && sb) {
                try {
                    let query = sb.from('registrations').select('*').order('created_at', { ascending: false });
                    if (filterCategory && filterCategory !== 'All') {
                        query = query.eq('category', filterCategory);
                    }
                    const { data, error } = await query;
                    if (!error && data && data.length > 0) {
                        const normalized = data.map(normalizeEventReference);
                        setLocal('registrations', normalized);
                        return normalized;
                    }
                } catch (e) {
                    console.warn('Error fetching cloud registrations, using local:', e);
                }
            }

            const regs = getLocal('registrations', INITIAL_REGISTRATIONS).map(normalizeEventReference);
            if (!filterCategory || filterCategory === 'All') return regs;
            return regs.filter(r => r.category.toLowerCase() === filterCategory.toLowerCase());
        },

        getRegistrationById: async function(id) {
            const regs = await this.getRegistrations('All');
            const search = String(id || '').trim().toLowerCase();
            const matches = registration => (
                String(registration.id || '').trim().toLowerCase() === search ||
                String(registration.roll_no || '').trim().toLowerCase() === search ||
                String(registration.chest_number || '').trim().toLowerCase() === search
            );
            return regs.find(matches) ||
                getLocal('registrations', INITIAL_REGISTRATIONS).map(normalizeEventReference).find(matches) ||
                null;
        },

        addRegistration: async function(regData) {
            regData = {
                ...regData,
                college_id: regData.college_id || COLLEGE_ID_BY_NAME[regData.college_name] || null
            };
            // Generate an ID that is safe across simultaneous browsers. Never
            // use a LocalStorage row count because multiple users can submit
            // at the same time.
            if (!regData.id) {
                regData.id = createRegistrationId();
            }
            if (!regData.created_at) {
                regData.created_at = new Date().toISOString();
            }
            if (!regData.status) {
                regData.status = 'Eligible';
            }

            const sb = window.getSupabase();
            let cloudSyncError = null;
            if (isCloudConnected && sb) {
                try {
                    const { data, error } = await sb.from('registrations').insert([regData]).select();
                    if (error) {
                        cloudSyncError = error;
                        console.error('Cloud insert error:', error);
                    } else if (data && data[0]) {
                        regData = { ...regData, ...data[0] };
                        console.log('✓ Synced new registration to Supabase cloud');
                    }
                } catch (e) {
                    cloudSyncError = e;
                    console.error('Cloud insert exception:', e);
                }
            }

            // Keep a local copy for offline use and immediate lookup. The
            // random ID prevents concurrent browser submissions from mixing.
            const localRegs = getLocal('registrations', INITIAL_REGISTRATIONS);
            localRegs.unshift(regData);
            setLocal('registrations', localRegs);

            return {
                ...regData,
                cloud_sync_error: cloudSyncError ? (cloudSyncError.message || String(cloudSyncError)) : null
            };
        },

        updateRegistrationStatus: async function(id, newStatus) {
            const localRegs = getLocal('registrations', INITIAL_REGISTRATIONS);
            const item = localRegs.find(r => r.id === id);
            if (item) {
                item.status = newStatus;
                item.updated_at = new Date().toISOString();
                setLocal('registrations', localRegs);
            }

            const sb = window.getSupabase();
            if (isCloudConnected && sb) {
                try {
                    await sb.from('registrations').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
                } catch (e) {
                    console.warn('Supabase status update error:', e);
                }
            }
            return item;
        },

        deleteRegistration: async function(id) {
            const sb = window.getSupabase();
            if (isCloudConnected && sb) {
                try {
                    const { data, error } = await sb
                        .from('registrations')
                        .delete()
                        .eq('id', id)
                        .select('id');
                    if (error) {
                        throw new Error(error.message || 'Supabase rejected the registration deletion.');
                    }
                    if (!data || data.length === 0) {
                        throw new Error('The registration was not deleted. Check the registration ID and Supabase DELETE policy.');
                    }
                } catch (e) {
                    console.error('Supabase delete registration error:', e);
                    throw e;
                }
            }

            let localRegs = getLocal('registrations', INITIAL_REGISTRATIONS);
            localRegs = localRegs.filter(r => r.id !== id);
            setLocal('registrations', localRegs);
            return true;
        },

        // ================= JUDGES (UNIQUE DESIGNATED EMAIL AUTH) =================
        getJudges: async function() {
            const sb = window.getSupabase();
            if (isCloudConnected && sb) {
                try {
                    const { data, error } = await sb.from('judges').select('*').order('name');
                    if (!error && data) {
                        const activeDirectory = data.filter(judge =>
                            !DEMO_JUDGE_EMAILS.has(String(judge.email || '').toLowerCase())
                        );
                        setLocal('judges', activeDirectory);
                        return activeDirectory;
                    }
                    if (!error && data && data.length === 0) {
                        const officialJudges = this.getOfficialJudgeDirectory();
                        const { data: seeded, error: seedError } = await sb
                            .from('judges')
                            .insert(officialJudges)
                            .select('*');
                        if (!seedError && seeded && seeded.length > 0) {
                            setLocal('judges', seeded);
                            return seeded;
                        }
                        setLocal('judges', officialJudges);
                        return officialJudges;
                    }
                } catch (e) {
                    console.warn('Error fetching judges from cloud:', e);
                }
            }
            return getLocalJudges();
        },

        getOfficialJudgeDirectory: function() {
            return INITIAL_JUDGES.map(judge => ({ ...judge }));
        },

        // STRICT VERIFICATION: ONLY Judge Emails designated by Admin are allowed!
        verifyJudgeByEmail: async function(email, pin = '1234') {
            const cleanEmail = (email || '').trim().toLowerCase();
            const judges = await this.getJudges();
            const judge = judges.find(j => (j.email || '').trim().toLowerCase() === cleanEmail);

            if (!judge) {
                return {
                    authorized: false,
                    message: ` ईमेल '${cleanEmail}' जज के रूप में अधिकृत नहीं है। कृपया एडमिन द्वारा प्रदान की गई आधिकारिक ईमेल का ही उपयोग करें।`
                };
            }

            if (!judge.is_active) {
                return {
                    authorized: false,
                    message: 'यह जज अकाउंट वर्तमान में निष्क्रिय (Deactivated) है। कृपया सुपर एडमिन से संपर्क करें।'
                };
            }

            // If PIN is configured and provided, check PIN
            if (judge.pin && pin && judge.pin !== pin) {
                return {
                    authorized: false,
                    message: 'अमान्य सिक्योरिटी पिन (Invalid Security PIN)। कृपया सही पिन दर्ज करें।'
                };
            }

            return {
                authorized: true,
                judge: judge,
                message: `नमस्ते ${judge.name}! जज पोर्टल में आपका स्वागत है।`
            };
        },

        addJudge: async function(judgeData) {
            judgeData.email = (judgeData.email || '').trim().toLowerCase();
            if (!judgeData.id) {
                judgeData.id = 'j-' + Math.random().toString(36).substr(2, 9);
            }
            if (!judgeData.pin) judgeData.pin = '1234';
            judgeData.is_active = judgeData.is_active !== false;

            const judges = getLocalJudges();
            // Check duplicate email
            if (judges.some(j => j.email === judgeData.email)) {
                throw new Error(`Email ${judgeData.email} is already registered for another judge.`);
            }

            judges.push(judgeData);
            setLocal('judges', judges);

            const sb = window.getSupabase();
            if (isCloudConnected && sb) {
                try {
                    await sb.from('judges').insert([judgeData]);
                } catch (e) {
                    console.warn('Supabase add judge error:', e);
                }
            }
            return judgeData;
        },

        updateJudge: async function(id, updatedData) {
            const judges = getLocalJudges();
            const idx = judges.findIndex(j => j.id === id);
            if (idx !== -1) {
                judges[idx] = { ...judges[idx], ...updatedData };
                setLocal('judges', judges);
            }

            const sb = window.getSupabase();
            if (isCloudConnected && sb) {
                try {
                    await sb.from('judges').update(updatedData).eq('id', id);
                } catch (e) {
                    console.warn('Supabase update judge error:', e);
                }
            }
            return judges[idx];
        },

        deleteJudge: async function(id) {
            let judges = getLocalJudges();
            judges = judges.filter(j => j.id !== id);
            setLocal('judges', judges);

            const sb = window.getSupabase();
            if (isCloudConnected && sb) {
                try {
                    await sb.from('judges').delete().eq('id', id);
                } catch (e) {
                    console.warn('Supabase delete judge error:', e);
                }
            }
            return true;
        },

        // ================= SCORES & EVALUATION =================
        getScores: async function(eventId = null) {
            const sb = window.getSupabase();
            if (isCloudConnected && sb) {
                try {
                    let query = sb.from('scores').select('*');
                    if (eventId) query = query.eq('event_id', eventId);
                    const { data, error } = await query;
                    if (!error && data) {
                        const normalized = data.map(normalizeEventReference);
                        setLocal('scores', normalized);
                        return normalized;
                    }
                } catch (e) {
                    console.warn('Cloud getScores error, fallback to local:', e);
                }
            }

            const scores = getLocal('scores', INITIAL_SCORES).map(normalizeEventReference);
            if (!eventId) return scores;
            return scores.filter(s => s.event_id === eventId);
        },

        getJudgeScores: async function(judgeEmail) {
            const email = String(judgeEmail || '').trim().toLowerCase();
            if (!email) throw new Error('A judge email is required to load evaluation scores.');

            const sb = window.getSupabase();
            if (isCloudConnected && sb) {
                try {
                    const [draftResult, lockedResult] = await Promise.all([
                        sb.from('scores')
                            .select('*')
                            .eq('judge_email', email)
                            .eq('is_locked', false),
                        sb.from('scores')
                            .select('registration_id,event_id,judge_email,is_locked')
                            .eq('judge_email', email)
                            .eq('is_locked', true)
                    ]);
                    if (draftResult.error) throw draftResult.error;
                    if (lockedResult.error) throw lockedResult.error;
                    return [
                        ...(draftResult.data || []),
                        ...(lockedResult.data || [])
                    ];
                } catch (error) {
                    console.warn('Cloud judge scores unavailable; using local cache:', error);
                }
            }

            return getLocal('scores', INITIAL_SCORES)
                .filter(score => String(score.judge_email || '').toLowerCase() === email)
                .map(score => score.is_locked
                    ? {
                        registration_id: score.registration_id,
                        event_id: score.event_id,
                        judge_email: score.judge_email,
                        is_locked: true
                    }
                    : score);
        },

        saveScore: async function(scoreData) {
            const sourceMax = Number(scoreData.source_max_score || scoreData.max_score);
            const finalMax = Number(scoreData.max_score);
            const rawScore = Number(scoreData.raw_score ?? scoreData.total_score);
            if (!Number.isFinite(sourceMax) || sourceMax <= 0 ||
                !Number.isFinite(finalMax) || finalMax <= 0 ||
                !Number.isFinite(rawScore) || rawScore < 0 || rawScore > sourceMax) {
                throw new Error('Score must be within the configured judging-performa maximum.');
            }
            scoreData = {
                ...scoreData,
                source_max_score: sourceMax,
                normalized_score: sourceMax === finalMax ? rawScore : (rawScore / sourceMax) * finalMax,
                total_score: sourceMax === finalMax ? rawScore : (rawScore / sourceMax) * finalMax
            };
            const scores = scoreData.judge_email
                ? await this.getJudgeScores(scoreData.judge_email)
                : await this.getScores();
            const existingIdx = scores.findIndex(score =>
                score.registration_id === scoreData.registration_id &&
                score.event_id === scoreData.event_id &&
                (score.judge_id === scoreData.judge_id || score.judge_email === scoreData.judge_email)
            );
            const existing = existingIdx >= 0 ? scores[existingIdx] : null;
            if (existing && existing.is_locked === true) {
                throw new Error('This score has been finalized and cannot be edited.');
            }

            const savedScore = {
                ...(existing || {}),
                ...scoreData,
                id: (existing && existing.id) || scoreData.id || ('sc-' + Math.random().toString(36).substr(2, 9)),
                updated_at: new Date().toISOString()
            };
            const sb = window.getSupabase();
            if (isCloudConnected && sb) {
                const cloudScore = { ...savedScore };
                if (String(cloudScore.id).startsWith('sc-')) delete cloudScore.id;
                const { data, error } = await sb.from('scores')
                    .upsert([cloudScore], { onConflict: 'registration_id,judge_id,event_id' })
                    .select()
                    .single();
                if (error) {
                    console.error('Supabase save score error:', error);
                    throw new Error(error.message || 'The score could not be saved to the cloud.');
                }
                if (data) Object.assign(savedScore, data);
            }

            if (existingIdx >= 0) scores[existingIdx] = savedScore;
            else scores.push(savedScore);
            setLocal('scores', scores);
            return savedScore;
        },

        // ================= LEADERBOARD & RESULT AGGREGATION =================
        getLeaderboard: async function(eventId = null) {
            const regs = await this.getRegistrations('All');
            const scores = await this.getScores(eventId);

            const eventFilteredRegs = eventId ? regs.filter(r => r.event_id === eventId) : regs;

            // Group scores by registration_id
            const leaderboard = eventFilteredRegs.map(reg => {
                const regScores = scores.filter(s => s.registration_id === reg.id);
                const judgeCount = regScores.length;
                const totalPoints = regScores.reduce((sum, s) => sum + Number(s.total_score || 0), 0);
                const isComplete = judgeCount === 3;
                const avgScore = isComplete ? (totalPoints / 3).toFixed(2) : 0;

                return {
                    registration: reg,
                    judgeScores: regScores,
                    judgeCount: judgeCount,
                    totalScore: totalPoints,
                    avgScore: Number(avgScore),
                    isComplete
                };
            });

            // Sort by average score descending
            leaderboard.sort((a, b) => b.avgScore - a.avgScore);

            // Assign ranks (First, Second, Third, Consolation)
            leaderboard.forEach((item, index) => {
                if (item.isComplete) {
                    if (index === 0) item.rank = '1st (Winner)';
                    else if (index === 1) item.rank = '2nd (Runner-up)';
                    else if (index === 2) item.rank = '3rd (Second Runner-up)';
                    else item.rank = `Rank ${index + 1}`;
                } else {
                    item.rank = 'Pending Evaluation';
                }
            });

            return leaderboard;
        },

        // ================= ADMIN AUTH =================
        verifyAdmin: function(email, password) {
            const cleanEmail = (email || '').trim().toLowerCase();
            if (cleanEmail === 'admin@cdlu.ac.in' && password === 'cdlu@2026') {
                return {
                    success: true,
                    admin: { name: 'Cultural Secretary (Super Admin)', email: 'admin@cdlu.ac.in', role: 'Super Admin' }
                };
            }
            if (cleanEmail === 'stage.admin@cdlu.ac.in' && password === 'stage@2026') {
                return {
                    success: true,
                    admin: { name: 'Stage Coordinator Admin', email: 'stage.admin@cdlu.ac.in', role: 'Stage Incharge' }
                };
            }
            return {
                success: false,
                message: 'अमान्य एडमिन ईमेल या पासवर्ड (Invalid Admin credentials)'
            };
        },

        // Age Limit Cutoff Date for 13th Triveni Yuva Mahotsav 2026 (Beginning of Academic Session 2026-27: July 01, 2026)
        getCutoffDate: function() {
            return '2026-07-01';
        },

        getOfficialEventAgeLimit: getOfficialEventAgeLimit,
        enrichEvent: enrichEventData,

        // Helper to check age eligibility according to official university rules
        checkAgeEligibility: function(dobString, eventObj) {
            if (!dobString) {
                return { isValid: false, message: 'कृपया जन्म तिथि दर्ज करें।' };
            }
            const parts = dobString.split('-').map(Number);
            if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
                return { isValid: false, message: 'अमान्य जन्म तिथि स्वरूप।' };
            }
            const birthDate = new Date(parts[0], parts[1] - 1, parts[2]);
            if (isNaN(birthDate.getTime())) {
                return { isValid: false, message: 'अमान्य जन्म तिथि।' };
            }

            const cutoffDate = new Date(2026, 6, 1); // 1st July 2026
            if (birthDate >= cutoffDate) {
                return { isValid: false, message: 'जन्म तिथि 1 जुलाई 2026 से पहले की होनी चाहिए।' };
            }

            let ageYears = cutoffDate.getFullYear() - birthDate.getFullYear();
            let ageMonths = cutoffDate.getMonth() - birthDate.getMonth();
            let ageDays = cutoffDate.getDate() - birthDate.getDate();

            if (ageDays < 0) {
                ageMonths--;
                const prevMonth = new Date(cutoffDate.getFullYear(), cutoffDate.getMonth(), 0);
                ageDays += prevMonth.getDate();
            }
            if (ageMonths < 0) {
                ageYears--;
                ageMonths += 12;
            }

            // Always resolve authoritative age limit by event ID / Name from official guidelines
            const eventId = eventObj ? (eventObj.id || '') : '';
            const eventName = eventObj ? (eventObj.name || '') : '';
            const officialLimit = getOfficialEventAgeLimit(eventId, eventName);

            // If officialLimit is null -> No Age Limit (Exempt items or Cultural Procession)
            if (officialLimit === null) {
                return {
                    isValid: true,
                    isRestricted: false,
                    ageYears,
                    ageMonths,
                    ageDays,
                    message: `इस प्रतियोगिता (शोभा यात्रा / ओपन इवेंट) में कोई आयु सीमा नहीं है • प्रतिभागी आयु: ${ageYears} वर्ष ${ageMonths} माह`
                };
            }

            // 25-Year Limit Enforcement (Items with 25 year in document)
            const isOver25 = (ageYears > officialLimit) || (ageYears === officialLimit && (ageMonths > 0 || ageDays > 0));
            if (isOver25) {
                return {
                    isValid: false,
                    isRestricted: true,
                    ageYears,
                    ageMonths,
                    ageDays,
                    maxAge: officialLimit,
                    message: `अपात्र (Not Eligible): 1 जुलाई 2026 को आयु ${ageYears} वर्ष ${ageMonths} माह है, जो ${officialLimit} वर्ष की अधिकतम सीमा से अधिक है। (जन्म 01/07/2001 या इसके बाद का होना अनिवार्य है)`
                };
            }

            if (ageYears < 15) {
                return {
                    isValid: false,
                    isRestricted: true,
                    ageYears,
                    ageMonths,
                    ageDays,
                    maxAge: officialLimit,
                    message: `अमान्य आयु: प्रतिभागी की आयु (${ageYears} वर्ष) विश्वविद्यालय युवा महोत्सव के लिए बहुत कम है।`
                };
            }

            return {
                isValid: true,
                isRestricted: true,
                ageYears,
                ageMonths,
                ageDays,
                maxAge: officialLimit,
                message: `पात्र (Eligible): 1 जुलाई 2026 को आयु ${ageYears} वर्ष ${ageMonths} माह (अधिकतम ${officialLimit} वर्ष की सीमा के अंतर्गत)`
            };
        },

        // Reset to initial demo seeds
        resetDemoData: function() {
            setLocal('events', INITIAL_EVENTS);
            setLocal('judges', INITIAL_JUDGES);
            setLocal('registrations', INITIAL_REGISTRATIONS);
            setLocal('scores', INITIAL_SCORES);
            return true;
        }
    };
})();

window.DBService = DBService;
