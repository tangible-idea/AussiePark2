// 초경량 아케이드 충돌 시스템.
// 본격 물리엔진 대신 원형 콜라이더 겹침 → 밀어내기/넉백 임펄스만 처리한다.
// (레일 워커 NPC + 조이스틱 플레이어 구조라 리지드바디 시뮬레이션은 과함)

// body: { kind: 'player'|'car'|'ped'|'ibis', r, x, z, hit?(nx, nz, force) }
// x/z는 소유 컴포넌트가 매 프레임 갱신, hit은 맞은 쪽 반응 콜백.
export const bodies = new Set()

export function registerBody(body) {
  bodies.add(body)
  return () => bodies.delete(body)
}

// self와 겹친 바디마다 cb(body, nx, nz, overlap) 호출.
// (nx, nz)는 상대 → self 방향 단위벡터 (self가 밀려날 방향).
export function forEachHit(self, cb) {
  for (const b of bodies) {
    if (b === self) continue
    const dx = self.x - b.x
    const dz = self.z - b.z
    const rr = self.r + b.r
    const d2 = dx * dx + dz * dz
    if (d2 >= rr * rr) continue
    const d = Math.sqrt(d2) || 0.001
    cb(b, dx / d, dz / d, rr - d)
  }
}
