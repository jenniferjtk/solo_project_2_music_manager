-- seed.sql
-- Music Manager — 30 seed records
--
-- Run after schema.sql.
-- Usage (MySQL CLI):
--   mysql -u root -p music_manager < seed.sql
--
-- image_url values use picsum.photos with per-song seeds so each row
-- gets a stable, unique placeholder image that always loads.

USE music_manager;

INSERT IGNORE INTO songs
  (id, title, artist, album, playlist, genre, duration_seconds, rating, play_count, image_url, created_at, updated_at)
VALUES
  ('s_001', 'Good Times Bad Times',                 'Led Zeppelin',           'Led Zeppelin',                                 'driving',        'Rock',   166,  5, 18, 'https://picsum.photos/seed/s001/120/120', 1730332800000, 1730332800000),
  ('s_002', 'In My Time of Dying',                  'Led Zeppelin',           'Physical Graffiti',                            'deep_listening', 'Rock',   668,  4,  9, 'https://picsum.photos/seed/s002/120/120', 1730246400000, 1730246400000),
  ('s_003', 'The Ocean',                            'Led Zeppelin',           'Houses of the Holy',                           'driving',        'Rock',   271,  4, 14, 'https://picsum.photos/seed/s003/120/120', 1730246400000, 1730246400000),
  ('s_004', 'Jericho',                              'Sister Rosetta Tharpe',  'Gospel Train',                                 'roots',          'Gospel', 123,  5, 22, 'https://picsum.photos/seed/s004/120/120', 1730246400000, 1730246400000),
  ('s_005', 'My Home''s Across the Blue Ridge Mountains', 'Joan Baez',        'Earl Scruggs Performing with His Family',      'folk',           'Folk',   269,  4, 11, 'https://picsum.photos/seed/s005/120/120', 1730246400000, 1730246400000),
  ('s_006', 'Murder''s Home',                       'Alan Lomax',             'Negro Prison Blues and Songs',                 'archive',        'Folk',    51,  3,  7, 'https://picsum.photos/seed/s006/120/120', 1730246400000, 1730246400000),
  ('s_007', 'When You Leave',                       'Andre Cruz',             'When You Leave',                               'chill',          'Soul',   296,  4, 13, 'https://picsum.photos/seed/s007/120/120', 1730073600000, 1730073600000),
  ('s_008', 'No Room For Blue',                     'Marcus King',            'Darling Blue',                                 'blues',          'Blues',  167,  5, 16, 'https://picsum.photos/seed/s008/120/120', 1729987200000, 1729987200000),
  ('s_009', 'I Will Never Marry',                   'Joan Baez',              'How Sweet the Sound',                          'folk',           'Folk',   182,  5, 19, 'https://picsum.photos/seed/s009/120/120', 1729987200000, 1729987200000),
  ('s_010', 'T-Bone Shuffle',                       'Albert Collins',         'Deluxe Edition',                               'blues',          'Blues',  296,  4, 12, 'https://picsum.photos/seed/s010/120/120', 1729987200000, 1729987200000),
  ('s_011', 'The Seventh Son',                      'Willie Dixon',           'Poet of the Blues',                            'blues',          'Blues',  255,  4, 10, 'https://picsum.photos/seed/s011/120/120', 1729987200000, 1729987200000),
  ('s_012', 'Two Bugs and a Roach',                 'Earl Hooker',            'Two Bugs and a Roach',                         'deep_listening', 'Blues',  260,  3,  8, 'https://picsum.photos/seed/s012/120/120', 1729987200000, 1729987200000),
  ('s_013', 'Mannish Boy',                          'Muddy Waters',           'King of the Electric Blues',                   'blues',          'Blues',  321,  5, 25, 'https://picsum.photos/seed/s013/120/120', 1729987200000, 1729987200000),
  ('s_014', 'Boom Boom',                            'John Lee Hooker',        'Whiskey & Wimmen',                             'driving',        'Blues',  154,  5, 21, 'https://picsum.photos/seed/s014/120/120', 1729987200000, 1729987200000),
  ('s_015', 'Can''t Leave You Alone',               'Susan Tedeschi',         'Just Won''t Burn',                             'chill',          'Blues',  182,  4, 17, 'https://picsum.photos/seed/s015/120/120', 1729900800000, 1729900800000),
  ('s_016', 'You Need to Be With Me',               'Susan Tedeschi',         'Just Won''t Burn',                             'chill',          'Blues',  185,  4, 15, 'https://picsum.photos/seed/s016/120/120', 1729900800000, 1729900800000),
  ('s_017', 'It Hurt So Bad',                       'Susan Tedeschi',         'Just Won''t Burn',                             'blues',          'Blues',  290,  5, 20, 'https://picsum.photos/seed/s017/120/120', 1729900800000, 1729900800000),
  ('s_018', 'Leader of the Pack',                   'Wunderhorse',            'Cub',                                          'alt',            'Rock',   183,  3,  6, 'https://picsum.photos/seed/s018/120/120', 1729468800000, 1729468800000),
  ('s_019', 'I Feel So Good',                       'J.B. Lenoir',            'Alabama Blues!',                               'roots',          'Blues',  115,  4,  9, 'https://picsum.photos/seed/s019/120/120', 1729468800000, 1729468800000),
  ('s_020', 'Four in the Morning',                  'Jesse Colin Young',      'The Soul of a City Boy',                       'folk',           'Folk',   205,  3,  7, 'https://picsum.photos/seed/s020/120/120', 1729382400000, 1729382400000),
  ('s_021', 'Edge of a Thought',                    'Buzz Gravelle',          'A Year of Living Quietly',                     'instrumental',   'Jazz',   224,  3,  6, 'https://picsum.photos/seed/s021/120/120', 1729382400000, 1729382400000),
  ('s_022', 'Spoonful',                             'Howlin'' Wolf',          'Howlin'' Wolf',                                'blues',          'Blues',  170,  5, 18, 'https://picsum.photos/seed/s022/120/120', 1729209600000, 1729209600000),
  ('s_023', 'First Time I Met the Blues',           'Buddy Guy',              'I Was Walking Through the Woods',              'blues',          'Blues',  139,  4, 12, 'https://picsum.photos/seed/s023/120/120', 1729123200000, 1729123200000),
  ('s_024', 'Done Somebody Wrong',                  'Elmore James',           'Shake Your Money Maker',                       'blues',          'Blues',  140,  5, 16, 'https://picsum.photos/seed/s024/120/120', 1729123200000, 1729123200000),
  ('s_025', 'Sweet Home Chicago',                   'Robert Johnson',         'King of the Delta Blues Singers',              'blues',          'Blues',  177,  5, 24, 'https://picsum.photos/seed/s025/120/120', 1729123200000, 1729123200000),
  ('s_026', 'Good Morning Judge',                   'Furry Lewis',            'Good Morning Judge',                           'archive',        'Blues',  331,  3,  5, 'https://picsum.photos/seed/s026/120/120', 1729123200000, 1729123200000),
  ('s_027', 'Bless the Telephone',                  'Labi Siffre',            'The Singer and the Song',                      'chill',          'Soul',   101,  4, 12, 'https://picsum.photos/seed/s027/120/120', 1729036800000, 1729036800000),
  ('s_028', 'Queens Highway',                       'Menahan Street Band',    'The Exciting Sounds of Menahan Street Band',   'instrumental',   'Jazz',    68,  3,  8, 'https://picsum.photos/seed/s028/120/120', 1729036800000, 1729036800000),
  ('s_029', 'Coffee Cold',                          'Galt MacDermot',         'Shapes of Rhythm',                             'instrumental',   'Jazz',   206,  3,  6, 'https://picsum.photos/seed/s029/120/120', 1728777600000, 1728777600000),
  ('s_030', 'Hesitation Blues',                     'Rev. Gary Davis',        'Pure Religion and Bad Company',                'folk',           'Folk',   200,  4, 11, 'https://picsum.photos/seed/s030/120/120', 1728777600000, 1728777600000);
