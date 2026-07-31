ALTER TABLE "User"
ADD COLUMN "passwordHash" TEXT,
ADD COLUMN "emailVerified" TIMESTAMP(3),
ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "VideoSubmission"
ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "sourceName" TEXT;

CREATE TABLE "VideoLike" (
  "userId" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VideoLike_pkey" PRIMARY KEY ("userId", "videoId")
);

CREATE TABLE "SavedVideo" (
  "userId" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SavedVideo_pkey" PRIMARY KEY ("userId", "videoId")
);

CREATE TABLE "Follow" (
  "followerId" TEXT NOT NULL,
  "followingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId", "followingId"),
  CONSTRAINT "Follow_not_self" CHECK ("followerId" <> "followingId")
);

CREATE TABLE "ShareEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShareEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VideoLike_videoId_createdAt_idx" ON "VideoLike"("videoId", "createdAt");
CREATE INDEX "SavedVideo_videoId_createdAt_idx" ON "SavedVideo"("videoId", "createdAt");
CREATE INDEX "Follow_followingId_createdAt_idx" ON "Follow"("followingId", "createdAt");
CREATE INDEX "ShareEvent_videoId_createdAt_idx" ON "ShareEvent"("videoId", "createdAt");
CREATE INDEX "ShareEvent_userId_createdAt_idx" ON "ShareEvent"("userId", "createdAt");

ALTER TABLE "VideoLike"
ADD CONSTRAINT "VideoLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VideoLike"
ADD CONSTRAINT "VideoLike_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoSubmission"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedVideo"
ADD CONSTRAINT "SavedVideo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedVideo"
ADD CONSTRAINT "SavedVideo_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoSubmission"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow"
ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow"
ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShareEvent"
ADD CONSTRAINT "ShareEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShareEvent"
ADD CONSTRAINT "ShareEvent_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoSubmission"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

DELETE FROM "User"
WHERE "email" IN (
  'creator@auratok.app',
  'nina@auratok.app',
  'mari@auratok.app'
)
OR "email" LIKE '%@guest.auratok.app';

INSERT INTO "User" (
  "id", "email", "name", "username", "bio", "isDemo", "auraBalance", "createdAt"
) VALUES
  (
    'demo_user_luna',
    'demo+luna@auratok.app',
    'Luna Azevedo',
    'luna.mov',
    'Parkour, movimento e coragem. Perfil de demonstração.',
    true,
    914,
    CURRENT_TIMESTAMP - INTERVAL '3 days'
  ),
  (
    'demo_user_kai',
    'demo+kai@auratok.app',
    'Kai Rocha',
    'kai.bmx',
    'BMX e linhas limpas. Perfil de demonstração.',
    true,
    782,
    CURRENT_TIMESTAMP - INTERVAL '2 days'
  ),
  (
    'demo_user_leo',
    'demo+leo@auratok.app',
    'Leo Nunes',
    'leo.trace',
    'Freerun em qualquer cenário. Perfil de demonstração.',
    true,
    866,
    CURRENT_TIMESTAMP - INTERVAL '1 day'
  )
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "VideoSubmission" (
  "id", "userId", "videoUrl", "caption", "status", "totalPoints", "analysis",
  "isDemo", "sourceUrl", "sourceName", "createdAt"
) VALUES
  (
    'demo_video_backflip',
    'demo_user_luna',
    'https://videos.pexels.com/video-files/6002020/6002020-uhd_2160_3840_30fps.mp4',
    'Um giro, uma aterrissagem e zero hesitação.',
    'APPROVED',
    914,
    '{"presence":228,"execution":241,"originality":205,"impact":240,"publicCaption":"O controle do corpo e a aterrissagem limpa transformam o backflip em um momento de presença total.","summary":"Backflip executado com confiança e aterrissagem controlada."}'::jsonb,
    true,
    'https://www.pexels.com/video/a-man-doing-a-backflip-6002020/',
    'Pexels · Mary Taylor',
    CURRENT_TIMESTAMP - INTERVAL '3 days'
  ),
  (
    'demo_video_bmx',
    'demo_user_kai',
    'https://videos.pexels.com/video-files/992592/992592-hd_1920_1080_25fps.mp4',
    'Quando a bicicleta parece ignorar a gravidade.',
    'APPROVED',
    782,
    '{"presence":190,"execution":219,"originality":181,"impact":192,"publicCaption":"Velocidade, equilíbrio e precisão sustentam uma sequência de BMX que prende o olhar.","summary":"Sequência de manobras de BMX executada em um skatepark."}'::jsonb,
    true,
    'https://www.pexels.com/video/bmx-tricks-992592/',
    'Pexels · Jessica Politi',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
  ),
  (
    'demo_video_parkour',
    'demo_user_leo',
    'https://videos.pexels.com/video-files/13184981/13184981-hd_1080_1920_30fps.mp4',
    'O caminho comum nunca foi uma opção.',
    'APPROVED',
    866,
    '{"presence":215,"execution":226,"originality":198,"impact":227,"publicCaption":"A leitura do espaço e a fluidez entre os obstáculos fazem a sequência parecer inevitável.","summary":"Atleta conecta saltos e movimentos de parkour em um parque urbano."}'::jsonb,
    true,
    'https://www.pexels.com/video/parkour-tricks-in-park-13184981/',
    'Pexels · Ali Alcántara',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
  )
ON CONFLICT ("id") DO NOTHING;
