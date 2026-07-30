import Link from "next/link";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Music2,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react";
import { posts } from "@/lib/mock";

export default function Feed() {
  return (
    <section className="reels-page">
      <header className="reels-topbar">
        <Link href="/" className="reels-brand" aria-label="AuraRank">
          AuraRank
        </Link>
        <nav className="reels-tabs" aria-label="Filtro do feed">
          <button type="button" className="reels-tab muted">Seguindo</button>
          <button type="button" className="reels-tab reels-tab-active">Para você</button>
        </nav>
        <Link href="/upload" className="reels-create" aria-label="Publicar vídeo">
          <span>+</span>
        </Link>
      </header>

      <div className="reels-feed" aria-label="Feed de vídeos de aura">
        {posts.map((post, index) => (
          <article className="reel" key={`${post.user.username}-${index}`}>
            <div className="reel-video">
              <button className="reel-sound" type="button" aria-label="Ativar som">
                <Volume2 size={17} />
              </button>

              <div className="aura-reward" aria-label={`${post.points} pontos de aura`}>
                <span className="aura-reward-label">Aura farmada</span>
                <strong>+{post.points.toLocaleString("pt-BR")}</strong>
                <Sparkles className="aura-spark" size={15} aria-hidden="true" />
              </div>

              <div className="aura-progress" aria-hidden="true">
                <span style={{ "--aura-progress": `${Math.min(92, 55 + index * 17)}%` } as React.CSSProperties} />
              </div>

              <div className="reel-gradient" />

              <div className="reel-content">
                <div className="reel-copy">
                  <Link href={`/perfil/${post.user.username}`} className="reel-author">
                    <span className="reel-avatar">{post.user.avatar}</span>
                    <strong>@{post.user.username}</strong>
                    <small>Seguir</small>
                  </Link>

                  <p>{post.caption}</p>

                  <div className="reel-music">
                    <Music2 size={14} />
                    <span>Som original • @{post.user.username}</span>
                  </div>
                </div>

                <aside className="reel-actions" aria-label="Ações do vídeo">
                  <button type="button" aria-label="Curtir">
                    <Heart size={27} />
                    <span>{index === 0 ? "12,8 mil" : "8.421"}</span>
                  </button>
                  <button type="button" aria-label="Comentar">
                    <MessageCircle size={27} />
                    <span>{index === 0 ? "684" : "392"}</span>
                  </button>
                  <button type="button" aria-label="Compartilhar">
                    <Send size={26} />
                    <span>{index === 0 ? "1.204" : "829"}</span>
                  </button>
                  <button type="button" aria-label="Salvar">
                    <Bookmark size={26} />
                  </button>
                </aside>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
