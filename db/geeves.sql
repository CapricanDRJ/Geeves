CREATE TABLE IF NOT EXISTS 'template' ('guild' TEXT NOT NULL, 'name' TEXT NOT NULL, 'type' INT NOT NULL);
CREATE TABLE IF NOT EXISTS "awayTimers" (
"guild"TEXT NOT NULL,
"mRoleId"TEXT NOT NULL,
"lifeTime"INTEGER NOT NULL,
"what"TEXT NOT NULL,
"who"TEXT NOT NULL,
"fromWho" TEXT, personal INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS 'management' (
"guild" TEXT NOT NULL,
"extraRoles" TEXT DEFAULT "[]");
CREATE TABLE IF NOT EXISTS "channels" (
"guild" TEXT NOT NULL,
"channelId" TEXT NOT NULL,
"mRoleId" TEXT NOT NULL,
"lRoleId" TEXT NOT NULL,
"cType" INT NOT NULL);
CREATE TABLE IF NOT EXISTS "whiteStar" (
"guild" TEXT NOT NULL,
"mRoleId" TEXT NOT NULL,
"lifeTime" INTEGER NOT NULL,
"awayMsgId" TEXT,
"awayChId" TEXT, 
"opponents" TEXT DEFAULT "[]",
"colour" INTEGER,
"novaDone" INTEGER NOT NULL DEFAULT 0,
"Battleship" INTEGER NOT NULL DEFAULT 0,
"Squishie" INTEGER NOT NULL DEFAULT 0,
"Flagship" INTEGER NOT NULL DEFAULT 0,
"EnemyBattleship" INTEGER NOT NULL DEFAULT 0,
"EnemySquishie" INTEGER NOT NULL DEFAULT 0,
"EnemyFlagship" INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS 'roster' (
  'serverId' TEXT NOT NULL,
  'channelId' TEXT NOT NULL,
  'messageId' TEXT NOT NULL,
  'userId' TEXT NOT NULL,
  'n0' BOOLEAN NOT NULL DEFAULT FALSE CHECK (n0 IN (0,1)),
  'n1' BOOLEAN NOT NULL DEFAULT FALSE CHECK (n1 IN (0,1)),
  'n2' BOOLEAN NOT NULL DEFAULT FALSE CHECK (n2 IN (0,1)),
  'n3' BOOLEAN NOT NULL DEFAULT FALSE CHECK (n3 IN (0,1)),
  'n4' BOOLEAN NOT NULL DEFAULT FALSE CHECK (n4 IN (0,1)),
  'n5' BOOLEAN NOT NULL DEFAULT FALSE CHECK (n5 IN (0,1)),
  'n6' BOOLEAN NOT NULL DEFAULT FALSE CHECK (n6 IN (0,1)),
  'n7' BOOLEAN NOT NULL DEFAULT FALSE CHECK (n7 IN (0,1)),
  'n8' BOOLEAN NOT NULL DEFAULT FALSE CHECK (n8 IN (0,1)),
  'n9' BOOLEAN NOT NULL DEFAULT FALSE CHECK (n9 IN (0,1)),
  'closed' BOOLEAN NOT NULL DEFAULT FALSE CHECK (closed IN (0,1)),
  'created_at' INTEGER DEFAULT (strftime('%s', 'now'))
);
